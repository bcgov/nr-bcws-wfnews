include.module("plugin-wfim-util", [], function () {
  "use strict";

  function infoHtml(properties, attributeDef, options) {
    var prop = infoProps(properties, attributeDef);
    var clz = [options.className, "wfml-info-content"]
      .filter((x) => x)
      .join(" ");

    var $top = makeEl("div", clz);
    if (options.title) {
      makeEl("div", "wfml-info-title", {
        parent: $top,
        text: options.title,
      });
    }

    for (var i = 0; i < prop.length; i++) {
      var $d = makeEl("div", "wfml-info-line", { parent: $top });
      makeEl("span", "wfml-info-name", {
        parent: $d,
        text: prop[i].name,
        title: prop[i].description,
      });

      makeEl("span", "wfml-info-value", {
        parent: $d,
        text: prop[i].value,
      });
    }

    return $top;
  }

  function infoProps(f, attributes, parameter) {
    if (attributes) return infoPropsFromAttr(f, attributes, parameter);
    return infoPropsRaw(f);
  }

  // Attributes in the info def are always shown, even if they are missing in feature.
  function infoPropsFromAttr(fprops, attributes, parameter) {
    var props = [];
    for (var i = 0; i < attributes.length; i++) {
      var propName = attributes[i].name;
      var propFormat = attributes[i].format;
      if (!propFormat && propName) {
        propFormat = `\$\{${propName}}`;
      }
      var val = attributes[i].value;
      if (propFormat && !val)
        val = infoPropDisplayValue(fprops, propFormat, parameter);

      // var name = attributes[i].title;
      // if (!name) name = attributes[i].name;
      props.push({
        name: attributes[i].title,
        value: val,
        description: attributes[i].description,
        action: attributes[i].action,
      });
    }
    return props;
  }

  function infoPropsRaw(fprops) {
    var props = [];
    for (var i in fprops) {
      if (fprops.hasOwnProperty(i)) {
        props.push({
          name: i,
          value: fprops[i],
        });
      }
    }
    return props;
  }

  function makeEl(tag, cls, opt) {
    opt = Object.assign({}, opt);

    var el = L.DomUtil.create(tag, cls, opt.parent);

    if (opt.text) el.append(document.createTextNode(opt.text));

    if (opt.title) el.setAttribute("title", opt.title);

    if (opt.on)
      Object.keys(opt.on).forEach(function (k) {
        L.DomEvent.on(el, k, opt.on[k]);
      });

    if (opt.children)
      opt.children.forEach(function (ch) {
        el.appendChild(ch);
      });

    return el;
  }

  function sexagesimalFraction(val, n, funct) {
    var sign = Math.sign(val);
    val = Math.abs(val);
    var result = [];
    for (var i = 1; i < n; i++) {
      var x = Math.floor(val);
      val = (val - x) * 60;
      result.push(x);
    }
    result.push(val);
    return funct(sign, result);
  }

  function unSexagesimal(val) {
    if (typeof val == "number") {
      return val;
    } else if (/^-?\d*(\.\d*)?$/.test(val)) {
      return 0.0 + val;
    } else {
      var result = 0;
      var divisor = 1;
      var sign = 1;
      if (/[NSEWnsew]$/.test(val)) {
        sign = /[SWsw]$/.test(val) ? -1 : 1;
        val = val.slice(0, -1);
      }
      val.split(/[DMSdms'"\s]+/).forEach((part) => {
        result += part / divisor;
        divisor *= 60;
      });

      return result * sign;
    }
  }

  function latDir(sign) {
    return [" S", "", " N"][sign + 1];
  }

  function lonDir(sign) {
    return [" W", "", " E"][sign + 1];
  }

  var TIME_FORMAT = Intl.DateTimeFormat("en-CA", {
    timeZone: undefined,
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  });
  var DATE_FORMAT = Intl.DateTimeFormat("en-CA", {
    timeZone: undefined,
    hour12: false,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  var FORMATTERS = {
    // Convert everyhting to floats then format consistently.
    DD: (val) =>
      sexagesimalFraction(
        unSexagesimal(val),
        1,
        (sign, components) =>
          `${sign < 0 ? "-" : ""}${components[0].toFixed(3)}°`,
      ),
    DM: (val) =>
      sexagesimalFraction(
        unSexagesimal(val),
        2,
        (sign, components) =>
          `${sign < 0 ? "-" : ""}${components[0]}° ${components[1].toFixed(
            3,
          )}′`,
      ),
    DMS: (val) =>
      sexagesimalFraction(
        unSexagesimal(val),
        3,
        (sign, components) =>
          `${sign < 0 ? "-" : ""}${components[0]}° ${
            components[1]
          }′ ${components[2].toFixed(3)}″`,
      ),
    DDLat: (val) =>
      sexagesimalFraction(
        unSexagesimal(val),
        1,
        (sign, components) => `${components[0].toFixed(3)}°${latDir(sign)}`,
      ),
    DMLat: (val) =>
      sexagesimalFraction(
        unSexagesimal(val),
        2,
        (sign, components) =>
          `${components[0]}° ${components[1].toFixed(3)}′${latDir(sign)}`,
      ),
    DMSLat: (val) =>
      sexagesimalFraction(
        unSexagesimal(val),
        3,
        (sign, components) =>
          `${components[0]}° ${components[1]}′ ${components[2].toFixed(
            3,
          )}″${latDir(sign)}`,
      ),
    DDLon: (val) =>
      sexagesimalFraction(
        unSexagesimal(val),
        1,
        (sign, components) => `${components[0].toFixed(3)}°${lonDir(sign)}`,
      ),
    DMLon: (val) =>
      sexagesimalFraction(
        unSexagesimal(val),
        2,
        (sign, components) =>
          `${components[0]}° ${components[1].toFixed(3)}′${lonDir(sign)}`,
      ),
    DMSLon: (val) =>
      sexagesimalFraction(
        unSexagesimal(val),
        3,
        (sign, components) =>
          `${components[0]}° ${components[1]}′ ${components[2].toFixed(
            3,
          )}″${lonDir(sign)}`,
      ),
    LatLon: (lat, lon) =>
      [
        { value: lat, dir: latDir },
        { value: lon, dir: lonDir },
      ]
        .map((e) =>
          sexagesimalFraction(
            unSexagesimal(e.value),
            2,
            (sign, components) =>
              `${components[0]}° ${components[1].toFixed(3)}′ ${e.dir(sign)}`,
          ),
        )
        .join(" "),

    // Convert to a date object then format consistently
    TimeStampMilli: (val) => {
      var date = new Date(val * 1);
      if (isNaN(date)) return val;
      return TIME_FORMAT.format(date);
    },
    TimeStampSec: (val) => {
      var date = new Date(val * 1000);
      if (isNaN(date)) return val;
      return TIME_FORMAT.format(date);
    },
    IsoTime: (val) => {
      var date = new Date(val);
      if (isNaN(date)) return val;
      return TIME_FORMAT.format(date);
    },
    IsoDate: (val) => {
      var date = new Date(val.toString().replace(/Z$/, ""));
      if (isNaN(date)) return val;
      return DATE_FORMAT.format(date);
    },
    IsoDateCompact: (val) => {
      val = val.toString();
      val = `${val.substring(0, 4)}-${val.substring(4, 6)}-${val.substring(
        6,
        8,
      )}`;
      var date = new Date(val);
      if (isNaN(date)) return val;
      return DATE_FORMAT.format(date);
    },
    USDate: (val) => {
      // Fix American style mm/dd/yyyy dates.
      var date = new Date(
        val.replace(
          /(\d\d)\/(\d\d)\/(\d\d\d\d)/,
          (m, month, day, year) => `${year}-${month}-${day}`,
        ),
      );
      if (isNaN(date)) return val;
      return DATE_FORMAT.format(date);
    },
    EUDate: (val) => {
      // Fix European style dd/mm/yyyy dates.
      var date = new Date(
        val.replace(
          /(\d\d)\/(\d\d)\/(\d\d\d\d)/,
          (m, day, month, year) => `${year}-${month}-${day}`,
        ),
      );
      if (isNaN(date)) return val;
      return DATE_FORMAT.format(date);
    },
    LightningPolarityName: (val) => {
      return val ? "Positive" : "Negative";
    },
    LightningPolaritySymbol: (val) => {
      return val ? "🞣" : "⭘";
    },
    //Use the first value that's neither undefined nor null
    FirstPresent: (...vals) =>
      vals.find((val) => !(val == undefined || val == null)),
    Phone: (area, phone, ext) => {
      phone = phone.trim();
      if (!phone) {
        return "N/A";
      } else {
        phone = phone.replace(/^(\d{3})(\d{4})$/, "$1-$2");
        if (area) phone = `${area}-${phone}`;
        if (ext) phone = `${phone} (ext ${ext})`;
        return phone;
      }
    },
    Name: (first, last) => [last, first].filter((name) => name).join(", "),
  };

  function infoPropDisplayValue(fprops, propFormat, parameter) {
    // Format strings are templates with substitution into ${} sections.
    // Inside each substution are up to three sections separated by pipes.
    // First is an attribute name, second is the name of a formatter, third is a default value
    // ${attr} Just the attribute 'attr'
    // ${attr|TimeStamp}  The attribute 'attr' formatted as a timestamp
    // ${attr||Foo} The attribute 'attr' if it is not null/empty, otherwise the string 'Foo'
    // ${attr|TimeStamp|Never} The attribute 'attr' formatted as a timestamp, or 'Never' if it's null.
    var prop = fprops;
    if (parameter) {
      var prop = Object.assign({}, fprops);
      Object.keys(parameter).forEach(function (k) {
        prop[`parameter.${k}`] = parameter[k];
      });
    }

    return propFormat.replace(
      /\$\{\s*(.*?)\s*(?:\|\s*(.*?)\s*(?:\|\s*(.*?)\s*)?)?\}/gi,
      (match, names, formatter, defaultString) => {
        if (!defaultString) {
          defaultString = "";
        }
        names = names.split(";");
        var vals = names.map((name) => prop[name]);
        if (names.some((name) => !prop.hasOwnProperty(name))) {
          return "##MISSING##";
        } else if (vals.every((val) => val == undefined)) {
          return defaultString;
        } else if (formatter) {
          var formatterFunction = FORMATTERS[formatter];
          if (formatterFunction) return formatterFunction(...vals);
          else throw `Unknown formatter ${formatter}`;
        } else {
          return vals.join("");
        }
      },
    );
  }

  function encodeUrl(url, data) {
    if (!data) return url;

    var params = Object.keys(data)
      .filter(function (k) {
        return data[k];
      })
      .map(function (k) {
        return `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`;
      })
      .join("&");

    if (/[?]\S+$/.test(url)) return `${url}&${params}`;

    if (/[?]$/.test(url)) return `${url}${params}`;

    return `${url}?${params}`;
  }

  function now(opt) {
    var d = new Date();
    if (opt.minute) d.setMinutes(d.getMinutes() + opt.minute);
    return d;
  }

  function resourceLabel(feature) {
    var time10minsAgo = now({ minute: -10 }).toISOString();
    var time30minsAgo = now({ minute: -30 }).toISOString();

    var status = "unknown";
    if (feature.properties.AT_BASE) status = "station";
    else if (feature.properties.POSITION_TIMESTAMP > time10minsAgo)
      status = "active";
    else if (feature.properties.POSITION_TIMESTAMP < time30minsAgo)
      status = "ground";
    else status = "lost";

    return `<span class="wfim-fire-resource-status-${status} wfim-fire-resource-alert-${(
      feature.properties.ALERT_STATUS || "unknown"
    ).toLowerCase()}" data-id="${feature.id}">${
      feature.properties.CALL_SIGN
    }</span>`;
  }

  function addFeatureId(geojson) {
    switch (geojson.type) {
      case "FeatureCollection":
        geojson.features.forEach(addFeatureId);

        return geojson;

      case "Feature":
        if (geojson.featureId) return geojson;

        geojson.featureId = hash(geojson.properties);

        return geojson;

      case "GeometryCollection":
      case "Point":
      case "MultiPoint":
      case "LineString":
      case "MultiLineString":
      case "Polygon":
      case "MultiPolygon":
        return geojson;

      default:
        throw new Error(`unknown geojson type: '${geojson.type}`);
    }
  }

  /**
   * Modified from http://stackoverflow.com/a/22429679
   *
   * Calculate a 32 bit FNV-1a hash
   * Found here: https://gist.github.com/vaiorabbit/5657561
   * Ref.: http://isthe.com/chongo/tech/comp/fnv/
   *
   * @param {any} val the input value
   * @returns {string}
   */
  function valueType(val) {
    var t = typeof val;
    if (t != "object") return t;
    if (Array.isArray(val)) return "array";
    if (val === null) return "null";
    return "object";
  }

  function hash(val) {
    var h = walk(0x811c9dc5, val);

    return ("0000000" + (h >>> 0).toString(16)).substr(-8);
  }

  var typeCode = {
    undefined: "\x00",
    null: "\x01",
    boolean: "\x02",
    number: "\x03",
    string: "\x04",
    function: "\x05",
    array: "\x06",
    object: "\x0a",
  };

  function walk(h, val) {
    var t = valueType(val);

    switch (t) {
      case "string":
        return addBits(h, val);

      case "array":
        h = addBits(h, typeCode[t]);

        for (var j1 in val) h = walk(h, val[j1]);

        return h;

      case "object":
        h = addBits(h, typeCode[t]);

        var keys = Object.keys(val).sort();
        for (var j2 in keys) {
          var key = keys[j2];
          h = addBits(h, key);

          h = walk(h, val[key]);
        }
        return h;

      case "undefined":
      case "null":
        return addBits(h, typeCode[t]);

      default:
        return addBits(h, typeCode[t] + String(val));
    }
  }

  function addBits(h, str) {
    for (var i = 0, l = str.length; i < l; i += 1) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }

    return h;
  }

  return {
    infoHtml,
    encodeUrl,
    resourceLabel,
    addFeatureId,
  };
});
