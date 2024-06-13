import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { IncidentDetailsPanel } from './incident-details-panel.component';
import { CommonModule } from '@angular/common';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { TextFieldModule } from '@angular/cdk/text-field'; 
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const formGroup: UntypedFormGroup = new UntypedFormGroup({
  fireName: new FormControl(),
  traditionalTerritory: new FormControl(),
  fireOfNote: new FormControl(),
  location: new FormControl(),
  wasFireOfNote: new FormControl(),
  sizeHectares: new FormControl(),
  sizeType: new FormControl(),
  sizeComments: new FormControl(),
  cause: new FormControl(),
  causeComments: new FormControl(),
})

formGroup['toJSON'] = () => null; 

const mockPublishedIncidentService = {
    fetchPublishedIncidentsList: () => Promise.resolve({ collection: [] })
};

const meta: Meta<IncidentDetailsPanel> = {
    title: 'Panels/IncidentDetailsPanel',
    component: IncidentDetailsPanel,
    decorators: [
        moduleMetadata({
            declarations: [IncidentDetailsPanel],
            imports: [
                CommonModule, 
                TextFieldModule,
                MatCardModule,
                MatFormFieldModule,
                MatRadioModule,
                MatSelectModule,
                MatInputModule,
                ReactiveFormsModule,
                BrowserAnimationsModule
            ],
            providers: [
                { provide: PublishedIncidentService, useValue: mockPublishedIncidentService },
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<IncidentDetailsPanel>;

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



