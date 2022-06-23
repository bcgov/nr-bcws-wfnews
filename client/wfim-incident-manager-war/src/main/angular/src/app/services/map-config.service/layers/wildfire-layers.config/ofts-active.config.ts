export function OftsActiveLayerConfig() {
    return {
        "id": "ofts-active",
        "title": "Active OFTS",
        "attributes": [
            {
                "title": "Ref #",
                "name": "id"
            },
            {
                "title": "Fire Centre",
                "name": "FireCentre"
            },
            {
                "title": "Expiry Date",
                "name": "ExpiryTimeStamp"
            },
            {
                "title": "Location",
                "value": "<%= $$.formatLatLon( $.Latitude, $.Longitude ) %>"
            },
            {
                "title": "Geographic",
                "name": "GeographicDescription"
            },
            {
                "title": "Client First Name",
                "name": "ClFirstName"
            },
            {
                "title": "Client Last Name",
                "name": "ClLastName"
            },
            {
                "title": "Phone Area Code",
                "name": "ClAreaCode"
            },
            {
                "title": "Phone Number",
                "name": "ClPhone"
            },
            {
                "title": "Phone Extension",
                "name": "ClPhoneExt"
            },
            {
                "title": "Burn Category",
                "name": "BurnCategoryCode"
            },
            {
                "title": "Burn Area",
                "name": "BurnArea"
            },
            {
                "title": "Number of Fires",
                "name": "PilesWindrows"
            }
        ],
        "type": "wms",
        "isQueryable": true,
        "layerName": "OFTS_ACTIVE",
        "geometryAttribute": "Geom"
    }
}