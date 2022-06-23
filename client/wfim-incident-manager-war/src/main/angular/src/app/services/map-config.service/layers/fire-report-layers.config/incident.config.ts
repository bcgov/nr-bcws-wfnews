export function IncidentLayerConfig() {
    return [
        {
            id: "incidents",
            title: "Incidents",
            type: "incidents",
            opacity: 1.0,
            isVisible: true,
            isQueryable: false
        },
        {
            id: "temporary-incident",
            title: "Incident (Temporary)",
            type: "incidents",
            opacity: 1.0,
            isVisible: true,
            isQueryable: false
        }
    ]
}
