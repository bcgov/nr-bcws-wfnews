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
        // console.log('availabletimeschanged',(new Date(ts[0])).toISOString(),(new Date(ts[ts.length-1])).toISOString())

        timeDimension.setCurrentTime(ts[0]);
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

      function setTimeInterval() {
        // return Promise.resolve()
        var ly = smk.$viewer.layerId["hourly-currentforecast-firesmoke"];
        var getUrl = function (ts) {
          return SMK.TYPE.Layer["image"]["leaflet"].getImageUrl(
            ly.config.baseUrl,
            ts,
          );
        };

        return determineTimeRange(getUrl).then(function (range) {
          var startTime = range[0],
            endTime = range[1];

          var ti = L.TimeDimension.Util.parseTimeInterval(
            `${startTime.toISOString()}/${endTime.toISOString()}`,
          );
          var times = L.TimeDimension.Util.explodeTimeRange(
            ti[0],
            ti[1],
            "PT1H",
          );
          // console.log( 'setTimeInterval',startTime.toISOString(),endTime.toISOString(),smk.$viewer.timeRangeMode)

          timeDimension.setAvailableTimes(
            times,
            smk.$viewer.getTimeRangeMode(),
          );
          timeDimension.setCurrentTime(startTime);
        });
      }

      self.changedVisible(function () {
        if (self.visible) {
          setTimeInterval().then(function () {
            if (self.visible) player.start(1);
          });
        } else {
          player.stop();
          smk.$viewer.timeRangeMode = "replace";
        }
      });

      smk.$viewer.changedLayerVisibility(function () {
        // console.log('changedLayerVisibility')
        self.visible =
          smk.$viewer.isDisplayContextItemVisible(
            "hourly-currentforecast-firesmoke",
          ) || smk.$viewer.isDisplayContextItemVisible("precipitation");
      });
    });

    function checkImage(url) {
      return new Promise(function (res, rej) {
        var img = new Image();
        img.onload = res;
        img.onerror = rej;
        img.src = url;
      });
    }

    function determineTimeRange(getUrl) {
      var start = new Date();
      start.setUTCMilliseconds(0);
      start.setUTCSeconds(0);
      start.setUTCMinutes(0);
      start.setHours(start.getHours() - 12);

      var imageCheck = [];
      for (var i = 0; i < 70; i++) {
        var ts = new Date(start);
        ts.setHours(ts.getHours() + i);
        var url = getUrl(ts);
        imageCheck[i] = {
          // url: url,
          time: ts,
          check: checkImage(url),
        };
      }

      // console.log(imageCheck)
      return Promise.all(
        imageCheck.map(function (i) {
          return i.check
            .then(function () {
              return true;
            })
            .catch(function () {
              return false;
            });
        }),
      ).then(function (statuses) {
        // console.log(statuses)
        var start, end, prev;
        imageCheck.forEach(function (check, i) {
          // console.log(i,check,start,end,prev)
          if (end) return;

          if (prev == null) {
            prev = statuses[i];
            if (prev) start = check.time;
            return;
          }

          if (prev == statuses[i]) return;

          if (prev && !statuses[i]) {
            end = imageCheck[i - 1].time;
          } else {
            start = check.time;
          }

          prev = statuses[i];
        });

        // console.log(start,end)
        return [start, end];
      });
    }
  },
);
