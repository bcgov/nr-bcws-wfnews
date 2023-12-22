//=======  Add delay to Layer tooltip  ===================

L.Layer.include({
  showDelay: 1200,
  hideDelay: 0,

  bindTooltipDelayed: function (content, options) {
    if (content instanceof L.Tooltip) {
      L.setOptions(content, options);
      this._tooltip = content;
      content._source = this;
    } else {
      if (!this._tooltip || options) {
        this._tooltip = new L.Tooltip(options, this);
      }
      this._tooltip.setContent(content);
    }

    this._initTooltipInteractionsDelayed();

    if (
      this._tooltip.options.permanent &&
      this._map &&
      this._map.hasLayer(this)
    ) {
      this.openTooltipWithDelay();
    }

    return this;
  },

  _openTooltipDelayed: function (e) {
    var layer = e.layer || e.target;

    if (!this._tooltip || !this._map) {
      return;
    }
    this.openTooltipWithDelay(
      layer,
      this._tooltip.options.sticky ? e.latlng : undefined,
    );
  },

  openTooltipDelayed: function (layer, latlng) {
    if (!(layer instanceof L.Layer)) {
      latlng = layer;
      layer = this;
    }
    if (layer instanceof L.FeatureGroup) {
      for (var id in this._layers) {
        layer = this._layers[id];
        break;
      }
    }
    if (!latlng) {
      latlng = layer.getCenter ? layer.getCenter() : layer.getLatLng();
    }
    if (this._tooltip && this._map) {
      this._tooltip._source = layer;
      this._tooltip.update();
      this._map.openTooltip(this._tooltip, latlng);
      if (this._tooltip.options.interactive && this._tooltip._container) {
        addClass(this._tooltip._container, "leaflet-clickable");
        this.addInteractiveTarget(this._tooltip._container);
      }
    }

    //layer.fireEvent('mousemove', lastMouseEvent);

    return this;
  },
  openTooltipWithDelay: function (t, i) {
    this._delay(this.openTooltipDelayed, this, this.showDelay, t, i);
  },
  closeTooltipDelayed: function () {
    if (this._tooltip) {
      this._tooltip._close();
      if (this._tooltip.options.interactive && this._tooltip._container) {
        removeClass(this._tooltip._container, "leaflet-clickable");
        this.removeInteractiveTarget(this._tooltip._container);
      }
    }
    return this;
  },
  closeTooltipWithDelay: function () {
    clearTimeout(this._timeout);
    this._delay(this.closeTooltipDelayed, this, this.hideDelay);
  },
  _delay: function (func, scope, delay, t, i) {
    var me = this;
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(function () {
      func.call(scope, t, i);
      delete me._timeout;
    }, delay);
  },
  _initTooltipInteractionsDelayed: function (remove$$1) {
    if (!remove$$1 && this._tooltipHandlersAdded) {
      return;
    }
    var onOff = remove$$1 ? "off" : "on",
      events = {
        remove: this.closeTooltipWithDelay,
        move: this._moveTooltip,
      };
    if (!this._tooltip.options.permanent) {
      events.mouseover = this._openTooltipDelayed;
      events.mouseout = this.closeTooltipWithDelay;
      events.click = this.closeTooltipWithDelay;
      if (this._tooltip.options.sticky) {
        events.mousemove = this._moveTooltip;
      }
      //  if (L.touch) {
      //  events.click = this._openTooltipDelayed;
      //  }
    } else {
      events.add = this._openTooltipDelayed;
    }
    this[onOff](events);
    this._tooltipHandlersAdded = !remove$$1;
  },
});

// Alter Tooltip to improve auto positioning for points near any map edge

L.Tooltip.include({
  _setPosition: function (pos) {
    var map = this._map,
      container = this._container,
      centerPoint = map.latLngToContainerPoint(map.getCenter()),
      tooltipPoint = map.layerPointToContainerPoint(pos),
      direction = this.options.direction,
      tooltipWidth = container.offsetWidth,
      tooltipHeight = container.offsetHeight,
      offset = L.point(this.options.offset),
      anchor = this._getAnchor();

    if (direction === "auto-all") {
      var mapMax = L.point(2 * centerPoint.x, 2 * centerPoint.y);
      var MARGIN = 20;

      var isClose = {
        left: tooltipPoint.x - tooltipWidth - MARGIN < 0,
        right: tooltipPoint.x + tooltipWidth + MARGIN > mapMax.x,
        top: tooltipPoint.y - tooltipHeight - MARGIN < 0,
        bottom: tooltipPoint.y + tooltipHeight + MARGIN > mapMax.y,
      };

      // show on top unless tooltip is close to a map edge or corner
      direction = "top";
      // user-supplied offset needs to be adjust as well
      var offsetDir = [0, -1];

      if (isClose.top) {
        direction = "bottom";
        offsetDir = [0, 1];
        if (isClose.left) {
          direction = "bottom-right";
          offsetDir = [1, 1];
        } else if (isClose.right) {
          direction = "bottom-left";
          offsetDir = [-1, 1];
        }
      } else if (isClose.bottom) {
        direction = "top";
        offsetDir = [0, -1];
        if (isClose.left) {
          direction = "top-right";
          offsetDir = [1, -1];
        } else if (isClose.right) {
          direction = "top-left";
          offsetDir = [-1, -1];
        }
      } else if (isClose.left) {
        direction = "right";
        offsetDir = [1, 0];
      } else if (isClose.right) {
        direction = "left";
        offsetDir = [-1, 0];
      }

      offset = L.point(offsetDir[0] * offset.x, offsetDir[1] * offset.y);
    }

    var ttClassDir = direction;
    if (direction === "top") {
      pos = pos.add(
        L.point(
          -tooltipWidth / 2 + offset.x,
          -tooltipHeight + offset.y + anchor.y,
          true,
        ),
      );
    } else if (direction === "top-left") {
      pos = pos.add(
        L.point(
          -(tooltipWidth + anchor.x - offset.x),
          -tooltipHeight + offset.y + anchor.y,
          true,
        ),
      );
    } else if (direction === "top-right") {
      pos = pos.add(
        L.point(
          offset.x + anchor.x,
          -tooltipHeight + offset.y + anchor.y,
          true,
        ),
      );
    } else if (direction === "bottom") {
      pos = pos.subtract(L.point(tooltipWidth / 2 - offset.x, -offset.y, true));
    } else if (direction === "bottom-left") {
      pos = pos.subtract(
        L.point(tooltipWidth + anchor.x - offset.x, -offset.y, true),
      );
    } else if (direction === "bottom-right") {
      pos = pos.subtract(L.point(-(offset.x + anchor.x), -offset.y, true));
    } else if (direction === "center") {
      pos = pos.subtract(
        L.point(
          tooltipWidth / 2 + offset.x,
          tooltipHeight / 2 - anchor.y + offset.y,
          true,
        ),
      );
    } else if (
      direction === "right" ||
      (direction === "auto" && tooltipPoint.x < centerPoint.x)
    ) {
      ttClassDir = "right";
      pos = pos.add(
        L.point(
          offset.x + anchor.x,
          anchor.y - tooltipHeight / 2 + offset.y,
          true,
        ),
      );
    } else {
      ttClassDir = "left";
      pos = pos.subtract(
        L.point(
          tooltipWidth + anchor.x - offset.x,
          tooltipHeight / 2 - anchor.y - offset.y,
          true,
        ),
      );
    }

    L.DomUtil.removeClass(container, "leaflet-tooltip-right");
    L.DomUtil.removeClass(container, "leaflet-tooltip-left");
    L.DomUtil.removeClass(container, "leaflet-tooltip-top");
    L.DomUtil.removeClass(container, "leaflet-tooltip-bottom");
    L.DomUtil.addClass(container, "leaflet-tooltip-" + ttClassDir);
    L.DomUtil.setPosition(container, pos);
  },
});
