include.tag( "layer-image",
    { loader: "group", tags: [
        { loader: "script", url: "./plugin-time-dimension/layer/layer-image.js" }
    ] }
);

include.tag( "layer-wms-time",
    { loader: "group", tags: [
        { loader: "script", url: "./plugin-time-dimension/layer/layer-wms-time.js" }
    ] }
);

include.tag( "layer-image-leaflet",
    { loader: "group", tags: [
        { loader: "script", url: "./plugin-time-dimension/viewer-leaflet/layer/layer-image-leaflet.js" }
    ] }
);

include.tag( "layer-wms-time-leaflet",
    { loader: "group", tags: [
        { loader: "script", url: "./plugin-time-dimension/viewer-leaflet/layer/layer-wms-time-leaflet.js" }
    ] }
);

include.tag( "tool-time-dimension",
    { loader: "group", tags: [
        { loader: "script", url: "./plugin-time-dimension/tool/time-dimension/tool-time-dimension.js" }
    ] }
);

include.tag( "tool-time-dimension-leaflet",
    { loader: "sequence", tags: [
        { loader: "style", url: "https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.control.min.css" },
        { loader: "script", url: "https://cdn.jsdelivr.net/npm/iso8601-js-period@0.2.1/iso8601.min.js" },
        { loader: "script", url: "https://cdn.jsdelivr.net/npm/leaflet-timedimension@1.1.1/dist/leaflet.timedimension.min.js" },
        { loader: "script", url: "./plugin-time-dimension/viewer-leaflet/tool/time-dimension/lib/time-dimension-layer-image-overlay.js" },
        { loader: "script", url: "./plugin-time-dimension/viewer-leaflet/tool/time-dimension/tool-time-dimension-leaflet.js" }
    ] }
);

include( 'layer-image-leaflet' )
include( 'layer-wms-time-leaflet' )
console.log('plugin-time-dimension loaded')
