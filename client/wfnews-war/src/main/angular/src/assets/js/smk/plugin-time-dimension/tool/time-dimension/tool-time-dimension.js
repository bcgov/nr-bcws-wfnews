include.module("tool-time-dimension", ["tool"], function () {
  "use strict";

  return SMK.TYPE.Tool.define("TimeDimensionTool", {
    construct: null,
    initialize: function (smk) {
      var self = this;

      SMK.HANDLER.get(this.id, "initialized")(smk, this);

      this.model = {
        time: null,
        visible: false,
        isPlaying: false,
      };

      this.vm = new Vue({
        // el: smk.addToOverlay( '<div class="smk-time-dimension"><div>{{ baseMap }}</div><div v-if="visible">{{ time }}</div></div>' ),
        el: smk.addToStatus(`
<div class="smk-time-dimension" v-if="visible" v-on:click.stop="toggle">
    <span class="play-pause">
        <i class="material-icons" v-if="isPlaying">pause</i>
        <i class="material-icons" v-if="!isPlaying">play_arrow</i>
    </span>
    <span>{{ time }}</span>
</div>
                `),
        data: this.model,
        methods: {
          toggle: function () {
            if (this.isPlaying) {
              self.pause();
            } else {
              self.resume();
            }
          },
        },
      });

      this.changedVisible(function () {
        self.model.visible = self.visible;
      });

      smk.$viewer.changedBaseMap(function (ev) {
        self.model.baseMap = ev.baseMap;
      });
    },
    methods: {
      updateTime(t) {
        this.model.time = t.toLocaleString();
      },

      setPlaying(isPlaying) {
        this.model.isPlaying = isPlaying;
      },

      pause() {
        console.log("pause");
      },
      resume() {
        console.log("resume");
      },
    },
  });
});
