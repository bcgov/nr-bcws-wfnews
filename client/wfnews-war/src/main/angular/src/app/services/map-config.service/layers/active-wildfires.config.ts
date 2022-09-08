import { layerSettings } from '.';

export function ActiveWildfiresLayerConfig(ls: layerSettings) {
    return [
        {
            type: 'esri-feature',
            id: 'active-wildfires',
            title: 'BC Wildfires - Active Fires',
            attribution: 'Copyright 117 DataBC, Government of British Columbia',
            serviceUrl: 'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0',
            where: 'FIRE_STATUS <> \'Out\'',
            opacity: 1,
            drawingInfo: {
                renderer: {
                    type: 'uniqueValue',
                    field1: 'FIRE_STATUS',
                    defaultSymbol: null,
                    uniqueValueInfos: [
                        {
                            value: 'Fire of Note',
                            symbol: {
                                angle: 0,
                                xoffset: 0,
                                yoffset: 0,
                                type: 'esriPMS',
                                url: '2462a401-17c5-47e6-aa5f-3588e69f2daa',
                                width: 11.25,
                                height: 16.250000000000004,
                                imageData: 'iVBORw0KGgoAAAANSUhEUgAAABIAAAAaCAYAAAC6nQw6AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAABcvAAAXLwG1k46fAAAAB3RJTUUH4QQDEzcJAUJuEAAAA19JREFUOMuF1U9sVFUUBvDfu+/NTGemMy102lJoS6VQS6EqCoYqmhiNkiiaQKJbFho3xhW6MLo1rEyMiSsTt7pwR9xowkISWagYiEbcCEqpC1uMBaZO/zwXc6cg4c9N7uLlnPOd7/vOyX2Ju5y5GZDhcXyPq0Pf3j43uPfZhmexfLek7B5s4AWMYuUOOQkq2U0fOdxCvRuHMH8HkBKewmJH2jQatyE2KfGQoGZV8RaQHryLvfihI+0BPIMPbpJEbka3XqsGLKlKNWO8juOx7mU0O4yW8Hpk1gHJJB7Ti8Sg1ECMFPA2juJTzN48tVaczqtII1C/zLRerOkTTMTcF/EmLuHrjq8doGIEPbLOKrdN2bAacsXoxRDekqhJ/CI31xHQAeqNk9sSNcOUbnWVGGkv5WtSe/Uh+NOvWrcCjUkkUdRLGJGY0itRWhe7T+4NQ1J1rMjcf2MuIe7CTmlcgMQEDsnsUI+iy6CqqN8YVpEbXo9EoC2YkmMTajJrjirapR4HvSGua1+87bMj1q4DPYwRedzjESQeUTKqgf7YoBStLqILiWE80VnQgKdRlcWEEVQEFcHGOIZG7N+IftWIjh6J7QUckKMSZWzFcEyuRyldEWhTBO54157kox2gcWK3bkxgEhujnJ5YnGIs2luNYLkePHdjagUMthOSwYz90cZCvCMRYHMEKUbvbpheDHILKrFznUL3uHRiE7sjI0nb5K2oJfQl7VdsYF1eCWmQOy3TDlYJaU1tw2Fhsod+snSzUK0xmSh17xYatbYF1cgyt4BWwOearrneXrQ8X1Uq71Hrf0Wo1JW6phVK90krDdX680Kl2jY9i7JzZ7GaSXyp6RsXHbSNfKmFNeXKjJCUJUlRtjrs3+ZZheKorLjZyuAcPyF32aqvBILEgtyHLpj3IyvnfrN09TvkSuU9il07lcoPqnQ/KQllhdJE+zdwxYqmT1x2DtJjIwguWDbvbxP5teWe5db5dK1yTVZpCGlVkpSkWT+C5YXzWid/vu6sj110XENz6HR8IOZmEAQto+r2GTdlVxgr7BkbL08c2F7aOD0Qsp60tXh+efHkZ2dWTsx+5JQvNDSHTrn9mcOlw8xuEf44pnfuRNfeK7/vf/+f+YPn/jqz/Z3Z9wznmNv5/7r/ALPYw78SkHupAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTA0LTAzVDE5OjU1OjA5LTA0OjAwnkdlngAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wNC0wM1QxOTo1NTowOS0wNDowMO8a3SIAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC',
                                contentType: 'image/png'
                            },
                            label: 'Fire of Note'
                        },
                        {
                            value: 'New',
                            symbol: {
                                color: [
                                    252,
                                    146,
                                    31,
                                    255
                                ],
                                size: 9,
                                angle: 0,
                                xoffset: 0,
                                yoffset: 0,
                                type: 'esriSMS',
                                style: 'esriSMSDiamond',
                                outline: {
                                    color: [
                                        26,
                                        26,
                                        26,
                                        255
                                    ],
                                    width: 0.75,
                                    type: 'esriSLS',
                                    style: 'esriSLSSolid'
                                }
                            },
                            label: 'New'
                        },
                        {
                            value: 'Out of Control',
                            symbol: {
                                color: [
                                    255,
                                    0,
                                    0,
                                    255
                                ],
                                size: 6.75,
                                angle: 0,
                                xoffset: 0,
                                yoffset: 0,
                                type: 'esriSMS',
                                style: 'esriSMSCircle',
                                outline: {
                                    color: [
                                        26,
                                        26,
                                        26,
                                        255
                                    ],
                                    width: 0.75,
                                    type: 'esriSLS',
                                    style: 'esriSLSSolid'
                                }
                            },
                            label: 'Out of Control'
                        },
                        {
                            value: 'Being Held',
                            symbol: {
                                color: [
                                    255,
                                    255,
                                    0,
                                    255
                                ],
                                size: 6.75,
                                angle: 0,
                                xoffset: 0,
                                yoffset: 0,
                                type: 'esriSMS',
                                style: 'esriSMSCircle',
                                outline: {
                                    color: [
                                        26,
                                        26,
                                        26,
                                        255
                                    ],
                                    width: 0.75,
                                    type: 'esriSLS',
                                    style: 'esriSLSSolid'
                                }
                            },
                            label: 'Being Held'
                        },
                        {
                            value: 'Under Control',
                            symbol: {
                                color: [
                                    152,
                                    230,
                                    0,
                                    255
                                ],
                                size: 6.75,
                                angle: 0,
                                xoffset: 0,
                                yoffset: 0,
                                type: 'esriSMS',
                                style: 'esriSMSCircle',
                                outline: {
                                    color: [
                                        26,
                                        26,
                                        26,
                                        255
                                    ],
                                    width: 0.75,
                                    type: 'esriSLS',
                                    style: 'esriSLSSolid'
                                }
                            },
                            label: 'Under Control'
                        }
                    ]
                },
                transparency: 0
            },
            attributes: [
                {
                    name: 'FIRE_NUMBER',
                    title: 'Fire Number'
                },
                {
                    name: 'IGNITION_DATE',
                    title: 'Date of Discovery',
                },
                {
                    name: 'FIRE_CAUSE',
                    title: 'Suspected Cause'
                },
                {
                    name: 'GEOGRAPHIC_DESCRIPTION',
                    title: 'Approximate Location'
                },
                {
                    name: 'CURRENT_SIZE',
                    title: 'Estimated Size'
                },
                {
                    name: 'FIRE_STATUS',
                    title: 'Stage of Control'
                },
                {
                    name: 'FIRE_OF_NOTE_NAME',
                    title: 'Fire of Note Information'
                }
            ],
            // popupTemplate: '@wf-feature',
            titleAttribute: 'FIRE_NUMBER',
            queries: [
                {
                    id: 'fire',
                    title: 'Active Fires',
                    description: '',
                    parameters: [
                        {
                            id: 'param1',
                            type: 'input',
                            title: 'Fire Name, Number, Location, or Stage of Control'
                        },
                        {
                            id: 'param2',
                            type: 'constant',
                            value: 'Out'
                        }
                    ],
                    predicate: {
                        operator: 'and',
                        arguments: [
                            {
                                operator: 'or',
                                arguments: [
                                    {
                                        operator: 'contains',
                                        arguments: [
                                            {
                                                operand: 'attribute',
                                                name: 'FIRE_NUMBER'
                                            },
                                            {
                                                operand: 'parameter',
                                                id: 'param1'
                                            }
                                        ]
                                    },
                                    {
                                        operator: 'contains',
                                        arguments: [
                                            {
                                                operand: 'attribute',
                                                name: 'FIRE_CAUSE'
                                            },
                                            {
                                                operand: 'parameter',
                                                id: 'param1'
                                            }
                                        ]
                                    },
                                    {
                                        operator: 'contains',
                                        arguments: [
                                            {
                                                operand: 'attribute',
                                                name: 'GEOGRAPHIC_DESCRIPTION'
                                            },
                                            {
                                                operand: 'parameter',
                                                id: 'param1'
                                            }
                                        ]
                                    },
                                    {
                                        operator: 'contains',
                                        arguments: [
                                            {
                                                operand: 'attribute',
                                                name: 'FIRE_STATUS'
                                            },
                                            {
                                                operand: 'parameter',
                                                id: 'param1'
                                            }
                                        ]
                                    },
                                    {
                                        operator: 'contains',
                                        arguments: [
                                            {
                                                operand: 'attribute',
                                                name: 'FIRE_OF_NOTE_NAME'
                                            },
                                            {
                                                operand: 'parameter',
                                                id: 'param1'
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                operator: 'not',
                                arguments: [
                                    {
                                        operator: 'equals',
                                        arguments: [
                                            {
                                                operand: 'attribute',
                                                name: 'FIRE_STATUS'
                                            },
                                            {
                                                operand: 'parameter',
                                                id: 'param2'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    ];
}
