import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { ResponseDetailsPanel } from './response-details-panel.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ResourceManagementService } from '@app/services/resource-management.service';
import { TextFieldModule } from '@angular/cdk/text-field'; 
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl, UntypedFormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Observable } from 'rxjs';

const mockResourceManagementService = {
    fetchResource: () => new Observable()
};

const formGroup: UntypedFormGroup = new UntypedFormGroup({
    responseComments: new FormControl(),
    aviationComments: new FormControl(),
})

formGroup['toJSON'] = () => null; 

const meta: Meta<ResponseDetailsPanel> = {
    title: 'Panels/ResponseDetailsPanel',
    component: ResponseDetailsPanel,
    decorators: [
        moduleMetadata({
            declarations: [ResponseDetailsPanel],
            imports: [
                CommonModule,
                MatDialogModule,
                BrowserAnimationsModule,
                TextFieldModule,
                MatCardModule,
                MatInputModule,
                MatFormFieldModule,
                MatCheckboxModule
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                { provide: ResourceManagementService, useValue: mockResourceManagementService},
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ResponseDetailsPanel>;

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



