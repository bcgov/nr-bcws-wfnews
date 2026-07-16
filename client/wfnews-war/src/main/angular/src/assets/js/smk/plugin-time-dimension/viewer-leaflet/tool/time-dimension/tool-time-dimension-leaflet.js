include.module(
  "tool-time-dimension-leaflet",
  ["tool-time-dimension", "leaflet"],
  function () {
    "use strict";

    SMK.TYPE.TimeDimensionTool.addInitializer(function (smk) {
      var self = this;

      var timeDimension = new L.TimeDimension(this.timeDimensionOptions);

      timeDimension.on("availabletimeschanged", function () {
        var ts = timeDimension.getAvailableTimes();
        if (ts && ts.length > 0) {
          timeDimension.setCurrentTime(ts[0]);
        }
      });

      timeDimension.on("timeload", function () {
        self.updateTime(new Date(timeDimension.getCurrentTime()));
      });

      smk.$viewer.map.timeDimension = timeDimension;

      var player = new L.TimeDimension.Player(
        {
          transitionTime: 500,
          loop: true,
          startOver: true,
        },
        timeDimension,
      );

      player.on("play", function () {
        self.setPlaying(true);
      });
      player.on("stop", function () {
        self.setPlaying(false);
      });

      this.resume = function () {
        player.release();
        player.fire("play");
      };
      this.pause = function () {
        player.pause();
        player.fire("stop");
      };

      smk.$viewer.timeRangeMode = "replace";
      smk.$viewer.getTimeRangeMode = function () {
        var m = this.timeRangeMode;
        this.timeRangeMode = "intersect";
        return m;
      };

      self.changedVisible(function () {
        if (self.visible) {
            player.start(1);
        } else {
            player.stop();
            smk.$viewer.timeRangeMode = "replace";
        }
      });

      smk.$viewer.changedLayerVisibility(function () {
        self.visible =
          smk.$viewer.isDisplayContextItemVisible(
            "eccc-pm25-smoke-forecast",
          ) || smk.$viewer.isDisplayContextItemVisible("precipitation");
      });
    });
  },
);
