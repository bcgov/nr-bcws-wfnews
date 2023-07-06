import { AppResourcesConfig } from "../app-config.service";

export function LayerDisplayConfig(res: AppResourcesConfig) {
    return [
        {
            id: 'active-wildfires-fire-of-note',
            isVisible: true,
            alwaysShowLegend: false,
            class: 'smk-inline-legend'
        },
        {
            id: 'active-wildfires-out-of-control',
            isVisible: true,
            alwaysShowLegend: false,
            class: 'smk-inline-legend'

        },
        {
            id: 'active-wildfires-holding',
            isVisible: true,
            alwaysShowLegend: false,
            class: 'smk-inline-legend'
        },
        {
            id: 'active-wildfires-under-control',
            isVisible: true,
            alwaysShowLegend: false,
            class: 'smk-inline-legend'
        },
        {
            id: "bcws-activefires-publicview-inactive",
            isVisible: false,
            class: "smk-inline-legend"
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
        {
            id: "hourly-currentforecast-firesmoke",
            isVisible: false
        },
        {
            id: "fire-perimeters",
            isVisible: true,
            class: "smk-inline-legend"
        },
        {
            id: "protected-lands-access-restrictions",
            isVisible: false,
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
        {
            id: "radar-1km-rrai--radarurpprecipr14-linear",
            isVisible: false
        },
        {
            id: "precipitation",
            isVisible: false
        },
        {
            id: "current-conditions--default",
            isVisible: false
        },
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
        {
            id: "weather-stations",
            isVisible: false,
            showItem: true
        },
        {
            id: "abms-regional-districts",
            isVisible: false,
            showItem: true,
            class: 'smk-inline-legend'
        }
    ]
}
