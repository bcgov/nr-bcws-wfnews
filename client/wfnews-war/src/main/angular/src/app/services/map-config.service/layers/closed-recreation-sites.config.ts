import { layerSettings } from '.';

export function ClosedRecreationSitesLayerConfig(ls: layerSettings) {
  return [
    {
      type: 'esri-feature',
      id: 'closed-recreation-sites',
      title: 'Closed Recreation Sites',
      attribution: 'Copyright 117 DataBC, Government of British Columbia',
      popupTemplate:
        '<div class="smk-popup"><div class="popup-header"><span>Closed Recreation Site</span></div><div class="popup-title">{{feature.properties["PROJECT_NAME"]}}</div><div class="popup-attributes"><div class="label">Location:</div><div class="attribute">{{feature.properties["SITE_LOCATION"]}}</div></div><div class="popup-attributes"><div class="label">Closure Date:</div><div class="attribute">{{new Date(feature.properties["CLOSURE_DATE"]).toISOString().slice(0, 10)}}</div></div><div class="popup-attributes"><div class="label">Comment:</div><div class="attribute">{{feature.properties["CLOSURE_COMMENT"]}}</div></div><div class="popup-button-container"><a class="popup-button" target="_blank" rel="noopener"v-bind:href="`http://www.sitesandtrailsbc.ca/search/search-result.aspx?site=${feature.properties[\'FOREST_FILE_ID\']}&type=${feature.properties[\'PROJECT_TYPE\'] === \'SIT - Recreation Site\' ? \'SITE\' : \'TRAIL\'}`">Learn More</a></div></div>',

      attributes: [
        {
          name: 'PROJECT_NAME',
          title: 'Name',
        },
        {
          name: 'FOREST_FILE_ID',
          title: 'ID',
        },
        {
          name: 'PROJECT_TYPE',
          title: 'Type',
        },
        {
          name: 'SITE_LOCATION',
          title: 'Site Location',
        },
        {
          name: 'SITE_DESCRIPTION',
          title: 'Site Description',
        },
        {
          name: 'CLOSURE_IND',
          title: 'Closure Indicator',
        },
        {
          name: 'CLOSURE_DATE',
          title: 'Closure Date',
        },
        {
          name: 'CLOSURE_TYPE',
          title: 'Closure Type',
        },
        {
          name: 'CLOSURE_COMMENT',
          title: 'Closure Comments',
        },
      ],
      serviceUrl:
        ls.services6BaseUrl + '/ubm4tcTYICKBpist/ArcGIS/rest/services/RecSitesReservesInterpForests_DetailsClosures_publicView/FeatureServer/0',
      where: 'CLOSURE_IND = \'Y\'',
      titleAttribute: 'PROJECT_NAME',
      drawingInfo: {
        renderer: {
          type: 'uniqueValue',
          field1: 'CLOSURE_IND',
          defaultSymbol: null,
          uniqueValueInfos: [
            {
              value: 'Y',
              symbol: {
                angle: 0,
                xoffset: 0,
                yoffset: 0,
                type: 'esriPMS',
                url: 'c99abdd1-24c7-47d8-b714-4ad35866dd99',
                width: 6.75,
                height: 8.620481927710843,
                imageData:
                  'iVBORw0KGgoAAAANSUhEUgAAAFMAAABqCAYAAADAx21lAAAAAXNSR0ICQMB9xQAAAAlwSFlzAAAXEgAAFxIBZ5/SUgAAABl0RVh0U29mdHdhcmUATWljcm9zb2Z0IE9mZmljZX/tNXEAAAOsSURBVHja7dwvdOJAEMfxysrKk0gkshKJRFYiK5HIQ1VG8lA1EN7DRCJPIiMjK5GVyF72XtPSHCH/fjM7uztidMvnZRnYb1/vlsvlnfSJ43jiwu8p/hdcr9f3Oeb7fr//pZg9Z7PZzHLMj+12+1sx+x/xP5+Yb4rZD3JoIC9G9HundMyohJkoZsfFk79fnkqYZ8mLSPJTOS1BFjNXzPZb/FCBmSlmizFHuQKymEfFbDjmM+UtzN1u96qYzY/4qebJPOcL6kExG3wPr4H8Nzn4s2LWYyZNMPNJFbN+8ZwbYpoZKWb1UzlvAWkmUsxqzKwl5rv5pqSY/0OOW0IWi2immKUxnx27YJorOsX8eanx0HLxlGeomN8f0p97QJp5Uczv98u0D6b5xiRhEUmAHPV8KouZBo+ZL54VAtNc2QWNWWRc0JP5YfsW3vbimaEgJeRg20f8CMZ8CxLzSsZFzSREzIgIMwkKsyLjosZaDrb1VE6JIK3mYFtb/ECMmQWBmb/QATFkMWPvMesyLmps5GAbR/zE9GSy52DuIz5hgrSSg7kxE05M7hzM9oM6ZFzUjLzDzF/UwgKkWUQrHzEzG5icOZgLcmwJkjUHc121vdrE5MrBHJcaD5YWD3sO5jjicwGQLH+XxIGZSsDkyMHUkCMhTyVLDqZePCtJmNQ5mPQ2HZlxXcjBlLdDM2mQ1DmY8ogfJWKaReQUJmHGFZ2DqTAj4ZiJE5jEGVd0DqZYPE/CIclyMAXmwRHMTDQmY8YVmYOhmFwZV2oORh9x6YuHNAcjj/jUMUj4InI544rLwa5nXFE52OmMKy0Hu55xReVg5zOupByMwNz5gGmuDK1iCsq4InKwLxlXRA72IuNKycE+ZVzrOdibjAt8Og+smJ8Z16fFU54BG6bUjIuarjnYq4yLXEQsmLH8jIuaCQdmFAhmQorpSMaF3cK3zcG+ZlzULCgxXcm4qMlIMGP3Mi5qxhSYLyFitsnBPmdc2CJqmoN9z7iomSMxk8AxUwimBxkXNaPemLHjGRe4iFa9Mc2/BFPMr0V03xkz9iTjAm+TZn0wvci4wKN+7ITpYcZFzbA1ZuxfxkVN1AUzVbir75uVObgK8lHhboI+Ncb0NeMCMQ+NMAPIuKgZ1GL6nnFRcy0HB5dxkYvoJmbs798PUc30FmakQK0muYoZWMaFXX5c5uCQMy5qFtcwQ8u4qMl+YMbhZlzUjC8xg8y4wNl9Yeri6b+IzJWlZlzczDXj4ib9C9b8q5ttvc3dAAAAAElFTkSuQmCC',
                contentType: 'image/png',
              },
              label: 'Closed',
            },
          ],
        },
        transparency: 0,
      },
    },
  ];
}
