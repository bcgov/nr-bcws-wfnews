export function Wf1CiFlnroRadioTowerLayerConfig() {
    return {
        "id": "wf1-ci-flnro-radio-tower",
        "title": "Radio Tower - FLNRO",
        "titleAttribute": "SiteName",
        "attributes": [
            {
                "title": "Site Name",
                "name": "SiteName"
            },
            {
                "title": "Location ID",
                "name": "LocationID"
            },
            {
                "title": "Colour",
                "name": "COLOUR"
            },
            {
                "title": "TX",
                "value": "<%= $$.formatUnit($.TX_FREQ, 'MHz') %>",
                "format": "HTML"
            },
            {
                "title": "RX",
                "value": "<%= $$.formatUnit($.RX_FREQ, 'MHz') %>",
                "format": "HTML"
            },
            {
                "title": "District",
                "name": "District"
            },
            {
                "title": "Height (Above sea level)",
                "value": "<%= $$.formatUnit($.Height_above_sea_level_meters, 'm') %>",
                "format": "HTML"
            },
            {
                "title": "Location",
                "value": "<%= $$.formatLatLon( $$.parseSexagesimal($.DDMLat), $$.parseSexagesimal($.DDMLon) ) %>"
            },
            {
                "title": "Description",
                "name": "Description"
            },
            {
                "title": "Building Type",
                "name": "BuildingType"
            },
            {
                "title": "Primary Power",
                "name": "PrimaryPower"
            },
            {
                "title": "CTCSS",
                "value": "<%= $$.formatUnit($.CTCSS, 'Hz') %>",
                "format": "HTML"
            },
            {
                "title": "BLT",
                "name": "BL"
            },
            {
                "title": "Split DTMF",
                "name": "SplitDTMF"
            },
            {
                "title": "Access",
                "name": "Access"
            },
            {
                "title": "Established",
                "value": "<%= $$.formatLocalDate($$.parseEUDate($.DateEstablished)) %>"
            },
            {
                "title": "Last Updated",
                "value": "<%= $.LastUpdateBy ? $.LastUpdateBy+': '+$$.formatLocalDate($$.parseEUDate($.lastupdateon)) : 'N/A' %>"
            }
        ],
        "type": "wms",
        "isQueryable": true,
        "layerName": "WF1_CI_FLNRO_RADIO_TOWER",
        "geometryAttribute": "SHAPE"
    }
}