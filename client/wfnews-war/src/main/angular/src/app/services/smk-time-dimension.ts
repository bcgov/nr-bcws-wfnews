import { readCapabilitiesTimes } from '@app/utils/wms-time-dimension';

// The layers that make the time-dimension tool appear.
const TIME_LAYER_IDS = ['eccc-pm25-smoke-forecast', 'precipitation'];
const TRANSITION_MS = 500;

/** Registers the `wms-time` Layer type and the `time-dimension` Tool with SMK. */
export function registerTimeDimension(SMK: any, Vue: any) {
  registerWmsTimeLayer(SMK);
  registerTimeDimensionTool(SMK, Vue);
}

/** Subclasses an SMK Layer type. They are ES classes, so they cannot be .apply()d. */
function extendLayer(Base: any) {
  function Layer(...args: any[]) {
    return Reflect.construct(Base, args, new.target || Layer);
  }
  Object.setPrototypeOf(Layer.prototype, Base.prototype);
  Object.setPrototypeOf(Layer, Base);
  return Layer as any;
}

function registerWmsTimeLayer(SMK: any) {
  const WmsTimeLayer = extendLayer(SMK.TYPE.Layer['wms']);
  SMK.TYPE.Layer['wms-time'] = WmsTimeLayer;

  const WmsTimeMapLibreLayer = extendLayer(WmsTimeLayer);
  WmsTimeLayer['maplibre'] = WmsTimeMapLibreLayer;

  // Time is one more WMS parameter, so the image layer is the plain WMS one.
  WmsTimeMapLibreLayer.create = (layers, zIndex) =>
    SMK.TYPE.Layer['wms']['maplibre'].create(layers, zIndex);

  // Null clears the parameter, which asks the server for its latest frame.
  WmsTimeMapLibreLayer.prototype.setTime = function (time) {
    this.setParams({
      time: time ? new Date(time).toISOString().slice(0, -5) + 'Z' : null,
    });
  };

  WmsTimeMapLibreLayer.prototype.getCapabilitiesUrl = function () {
    const cfg = this.config || {};
    return (
      cfg.capabilitiesUrl ||
      (cfg.serviceUrl || cfg.baseUrl) + '?service=WMS&version=1.3.0&request=GetCapabilities'
    );
  };
}

function registerTimeDimensionTool(SMK: any, Vue: any) {
  const h = Vue.h;

  const factory = SMK.TYPE.Tool.define('TimeDimensionTool', {
    construct: null,
    initialize(smk) {
      const self = this;

      SMK.HANDLER.get(this.id, 'initialized')(smk, this);

      this.model = Vue.reactive({ time: null, visible: false, isPlaying: false });

      this.vm = SMK.mount(smk.addToStatus('<div>'), {
        data: this.model,
        render() {
          if (!this.visible) return null;
          return h('div', { class: 'smk-time-dimension', onClick: Vue.withModifiers(this.toggle, ['stop']) }, [
            h('span', { class: 'play-pause' }, [
              h('i', { class: 'material-icons' }, this.isPlaying ? 'pause' : 'play_arrow'),
            ]),
            h('span', this.time),
          ]);
        },
        methods: {
          toggle() {
            if (this.isPlaying) self.pause();
            else self.resume();
          },
        },
      });

      this.changedVisible(() => {
        self.model.visible = self.visible;
      });

      smk.$viewer.changedBaseMap((ev) => {
        self.model.baseMap = ev.baseMap;
      });
    },
    methods: {
      updateTime(t: Date) {
        this.model.time = t.toLocaleString();
      },
      setPlaying(isPlaying: boolean) {
        this.model.isPlaying = isPlaying;
      },
      pause() {},
      resume() {},
    },
  });

  SMK.TYPE['tool-time-dimension'] = factory;

  // MapLibre has no TimeDimension plugin: read the frames from GetCapabilities,
  // step through them on a timer, and tell each time layer which one to draw.
  SMK.TYPE.TimeDimensionTool.addInitializer(function (smk) {
    if (smk.$viewer.type !== 'maplibre') return;

    const self = this;
    let times: number[] = [];
    let index = 0;
    let timer = null;

    const timeLayers = () =>
      TIME_LAYER_IDS.map((id) => smk.$viewer.layerId[id]).filter(
        (ly) => ly && typeof ly.setTime === 'function',
      );

    const showFrame = (i: number) => {
      if (!times.length) return;
      index = ((i % times.length) + times.length) % times.length;
      const t = times[index];
      timeLayers().forEach((ly) => ly.setTime(t));
      self.updateTime(new Date(t));
    };

    const loadTimes = () => {
      const layers = timeLayers();
      if (!layers.length) return Promise.resolve([]);

      return readCapabilitiesTimes(layers[0].getCapabilitiesUrl(), layers[0].config?.layerName).then(
        (ts) => {
          times = ts;
          if (times.length) showFrame(0);
          return times;
        },
      );
    };

    this.resume = () => {
      if (timer) return;
      if (!times.length) {
        loadTimes().then(() => {
          if (times.length) self.resume();
        });
        return;
      }
      self.setPlaying(true);
      timer = setInterval(() => showFrame(index + 1), TRANSITION_MS);
    };

    this.pause = () => {
      if (timer) clearInterval(timer);
      timer = null;
      self.setPlaying(false);
    };

    this.changedVisible(() => {
      if (self.visible) {
        loadTimes().then(() => self.resume());
      } else {
        self.pause();
        // Back to the server default, so a hidden tool leaves no stale frame.
        timeLayers().forEach((ly) => ly.setTime(null));
      }
    });

    smk.$viewer.changedLayerVisibility(() => {
      self.visible = TIME_LAYER_IDS.some((id) => smk.$viewer.isDisplayContextItemVisible(id));
    });
  });
}
