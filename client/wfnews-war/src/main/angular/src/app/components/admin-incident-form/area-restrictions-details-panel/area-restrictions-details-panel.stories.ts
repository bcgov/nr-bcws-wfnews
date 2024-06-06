import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { AreaRestrictionsDetailsPanel } from './area-restrictions-details-panel.component';
import { AGOLService } from '@app/services/AGOL-service';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';

const mockAgolService = {
    getAreaRestrictions: () => new Observable()
};

const formGroup: UntypedFormGroup = new UntypedFormGroup({})

const meta: Meta<AreaRestrictionsDetailsPanel> = {
    title: 'Panels/AreaRestrictionsDetailsPanel',
    component: AreaRestrictionsDetailsPanel,
    decorators: [
        moduleMetadata({
            declarations: [AreaRestrictionsDetailsPanel],
            imports: [MatCardModule,
                ReactiveFormsModule,
            ],
            providers: [
                { provide: AGOLService, useValue: mockAgolService }
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<AreaRestrictionsDetailsPanel>;

// Story for the default desktop view
export const Default: Story = {
    args: {
        incident: {
            aviationComments: "These are aviation comments",
            aviationInd: true,
            cause: 2,
            causeComments: "These are cause comments",
            contact: {
                isPrimary: true,
                fireCentre: "Coastal Fire Centre",
                phoneNumber: "250-951-4209",
                emailAddress: "BCWS.COFCInformationOfficer@gov.bc.ca",
            },
            crewsComments: "These are crews comments",
            evacOrders: [],
            fireName: "Test fire",
            fireNumber: 45052,
            fireOfNote: false,
            wasFireOfNote: false,
            geometry: {
                x: 49.5,
                y: -123.6,
            },
            heavyEquipmentComments: "These are heavy equipment comments",
            heavyEquipmentInd: true,
            incidentData: null,
            incidentManagementComments: "These are incident management comments",
            incidentManagementInd: true,
            incidentNumberSequence: 1075,
            incidentLabel: "K45052",
            incidentOverview: '',
            lastPublished: 1714506966286,
            location: undefined,
            mapAttachments: [],
            publishedStatus: 'PUBLISHED',
            responseComments: "These are response comments",
            responseTypeCode: "FULL",
            sizeComments: undefined,
            sizeHectares: 10,
            sizeType: 1,
            stageOfControlCode: 2,
            structureProtectionComments: "These are structure comments",
            structureProtectionInd: false,
            traditionalTerritory: "Salish Territory",
            wildfireIncidentGuid: '19B36F72FA641A81E0631D09228ECBDA',
            wildfireYear: new Date().getFullYear(),
            wildifreCrewsInd: true,
            crewResourceCount: 1,
            aviationResourceCount: 1,
            heavyEquipmentResourceCount: 1,
            incidentManagementResourceCount: 1,
            structureProtectionResourceCount: 1,
            signOffSignatureGuid: undefined,
        },
        formGroup: formGroup
    }
};



