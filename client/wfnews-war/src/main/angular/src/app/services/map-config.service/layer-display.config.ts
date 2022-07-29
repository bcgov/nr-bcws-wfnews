import { MapServices } from ".";

export function LayerDisplayConfig(mapServices: MapServices) {
    return [
        {
            id: "active-wildfires",
            isVisible: true,
            alwaysShowLegend: false
        },
        {
            id: "evacuation-orders-and-alerts-wms",
            isVisible: true,
            alwaysShowLegend: false
        },
        {
            id: "evacuation-orders-and-alerts-wms-highlight",
            isVisible: false,
            showItem: false
        },
        {
            id: "danger-rating",
            isVisible: false,
            alwaysShowLegend: false
        },
        {
            id: "bans-and-prohibitions",
            isVisible: false,
            class: "smk-inline-legend"
        },
        {
            id: "bans-and-prohibitions-highlight",
            isVisible: false,
            showItem: false
        },
        {
            id: "area-restrictions",
            isVisible: false,
            class: "smk-inline-legend"
        },
        {
            id: "area-restrictions-highlight",
            isVisible: false,
            showItem: false
        },
        // {
        //     id: "hourly-currentforecast-firesmoke",
        //     isVisible: false
        // },
        {
            id: "fire-perimeters",
            isVisible: true,
            class: "smk-inline-legend"
        },
        {
            id: "bcws-activefires-publicview-inactive",
            isVisible: false,
            class: "smk-inline-legend"
        },
        {
            id: "closed-recreation-sites",
            isVisible: false,
            class: "smk-inline-legend"
        },
        {
            id: "drive-bc-active-events",
            isVisible: false
        },
        // {
        //     id: "radar-1km-rrai--radarurpprecipr14-linear",
        //     isVisible: false
        // },
        // {
        //     id: "precipitation",
        //     isVisible: false
        // },
        // {
        //     id: "current-conditions--default",
        //     isVisible: false
        // },
        {
            id: "bc-fire-centres",
            isVisible: true,
            class: "smk-inline-legend"
        },
        {
            id: "prescribed-fire",
            isVisible: false,
            class: "smk-inline-legend"
        },
    //     {
    //         id: "weather-stations",
    //         isVisible: true,
    //         showItem: false
    //     }
    ]
}