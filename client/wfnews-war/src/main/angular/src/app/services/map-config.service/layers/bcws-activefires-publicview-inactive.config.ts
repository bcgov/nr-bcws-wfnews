import { layerSettings } from '.';

function cacheBustString (length) {
  let result           = ''
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
 }
 return result;
}

export function WildfiresInactiveLayerConfig(ls: layerSettings) {
    return [
        {
          type: 'vector',
          id: 'bcws-activefires-publicview-inactive',
          title: 'BC Wildfires - Declared Out',
          isQueryable: true,
          useClustering: true,
          useHeatmap: false,
          dataUrl: ls.wfnewsUrl + "/publicPublishedIncident/features?stageOfControl=OUT&cachBust=" + cacheBustString(7),
          titleAttribute: "incidentName",
          popupTemplate: '@wf-incident-feature',
          attributes: [
            {
                name: "incidentName",
                title: "Fire Name",
                visible: true
            }
          ],
          style:{
            strokeWidth:"7",
            strokeStyle:"1",
            strokeColor:"#5c6671",
            strokeOpacity:"1",
            fillColor:"#5c6671",
            fillOpacity:"1",
            fill: true
          }
        }
    ];
}
