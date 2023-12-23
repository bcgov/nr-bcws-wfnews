include.module(
  "layer-incidents-leaflet",
  ["layer-incidents", "plugin-wfim-util"],
  function (inc) {
    "use strict";

    function IncidentsLeafletLayer() {
      SMK.TYPE.Layer["incidents"].prototype.constructor.apply(this, arguments);
      SMK.TYPE.Layer["fire-reports-cluster"]["leaflet"].call(this, arguments);
      this.clickCallback = function () {};
    }

    $.extend(
      IncidentsLeafletLayer.prototype,
      SMK.TYPE.Layer["incidents"].prototype,
    );

    SMK.TYPE.Layer["incidents"]["leaflet"] = IncidentsLeafletLayer;
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    const incidentAttributesFire = [
      { title: "Incident #", name: "incidentLabel" },
      { title: "Year", name: "wildfireYear" },
      { title: "Type", name: "incidentTypeCode" },
      { title: "Stage of Control", name: "stageOfControlCode" },
      { title: "Centre", name: "fireCentreOrgUnitIdentifier" },
      { title: "Zone", name: "zoneOrgUnitIdentifier" },
      { title: "Location", name: "latLon" },
      { title: "Geographic", name: "geographicDescription" },
      { title: "Size", name: "fireSizeHectares" },
      { title: "Cause", name: "suspectedCauseCategoryCode" },
    ];

    const incidentAttributesOther = [
      { title: "Incident #", name: "incidentLabel" },
      { title: "Year", name: "wildfireYear" },
      { title: "Type", name: "incidentTypeCode" },
      { title: "Status", name: "incidentStatusCode" },
      { title: "Centre", name: "fireCentreOrgUnitIdentifier" },
      { title: "Zone", name: "zoneOrgUnitIdentifier" },
      { title: "Location", name: "latLon" },
      { title: "Geographic", name: "geographicDescription" },
      { title: "Size", name: "fireSizeHectares" },
      { title: "Cause", name: "suspectedCauseCategoryCode" },
    ];

    const incidentFireTypes = ["fire", "nuisance fire"];
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    SMK.TYPE.Layer["incidents"]["leaflet"].create = function (layers, zIndex) {
      var self = this;
      // console.log( 'create layer incidents' )

      var pointHandler = function (ly, feature) {
        if (feature.set == "incidents") {
          var soc = feature.properties.stageOfControlCode;
          var type = feature.properties.incidentTypeCode;
          var status = feature.properties.incidentStatusCode;
          var incidentIcon = "incident-icon";
          var width = (feature.properties.incidentLabel.length * 50) / 7;

          if (type) {
            incidentIcon =
              incidentIcon +
              " incident-type-" +
              type.toLowerCase().replace(/\s/g, "-");
          }
          if (soc) {
            incidentIcon =
              incidentIcon +
              " incident-soc-" +
              soc.toLowerCase().replace(/\s/g, "-");
          }
          if (status) {
            incidentIcon =
              incidentIcon +
              " incident-status-" +
              status.toLowerCase().replace(/\s/g, "-");
          }

          return {
            icon: L.divIcon({
              className: "wfim-incident",
              html: `<div class="incident-label">${feature.properties.incidentLabel}</div><div class="${incidentIcon}"></div>`,
              iconSize: [width, 36],
              iconAnchor: [width / 2, 27],
            }),
          };
        }
      };

      var featureHandler = function (ly, feature, leafLayer) {
        if (feature.set == "incidents") {
          var type = feature.properties.incidentTypeCode.toLowerCase();
          var incidentAttributes = incidentFireTypes.includes(type)
            ? incidentAttributesFire
            : incidentAttributesOther;

          leafLayer.hideDelay = 800;
          leafLayer.bindTooltipDelayed(
            function (featureLayer) {
              return inc["plugin-wfim-util"].infoHtml(
                feature.properties,
                incidentAttributes,
                {
                  className: "incident-tooltip",
                  title: "Incident - " + feature.properties.hoverTitle,
                },
              );
            },
            {
              permanent: false,
              direction: "auto-all",
              offset: [20, 20],
              className: "incident-tooltip",
            },
          );
        }
      };

      var layerCreate = function () {
        var layer = L.geoJSON(null, {
          pointToLayer: function (geojson, latlng) {
            var mark = L.marker(
              latlng,
              Object.assign(
                {
                  layerId: self.id,
                },
                pointHandler(self, geojson),
              ),
            );
            return mark;
          },
          onEachFeature: function (feature, leafLayer) {
            featureHandler(self, feature, leafLayer);

            leafLayer.on("click", function (event) {
              return layers[0].clickCallback(event);
            });
          },
          style: function (feature) {
            return feature.properties._style || {};
          },
        });

        layer.on({
          add: function () {
            if (layer.options?.renderer?._container)
              layer.options.renderer._container.style.zIndex = zIndex;
          },
        });

        return layer;
      };

      layers[0].loadLayer = function (data) {
        layers[0].updateClusters(function () {
          var ly = layerCreate();
          // console.log( 'load layer incidents' )
          data.forEach(function (ft) {
            ly.addData(ft);
          });
          return ly;
        });
      };

      layers[0].afterLoadLayer = function () {};

      if (layers[0].loadCache) {
        layers[0].loadLayer(layers[0].loadCache);
        layers[0].loadCache = null;
      }

      layers[0].clearLayer = function () {
        layers[0].updateClusters(null);
      };

      // return Promise.resolve( layer )
      // return layer
    };
    // _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
    //
    IncidentsLeafletLayer.prototype.setClickCallback = function (cb) {
      this.clickCallback = cb;
    };
  },
);
