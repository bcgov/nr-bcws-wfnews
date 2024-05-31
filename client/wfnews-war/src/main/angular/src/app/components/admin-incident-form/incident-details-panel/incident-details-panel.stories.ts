import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { IncidentDetailsPanel } from './incident-details-panel.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { AppConfigService } from '@wf1/core-ui';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { of } from 'rxjs';
import { TextFieldModule } from '@angular/cdk/text-field'; 

const mockPublishedIncidentService = {
    fetchPublishedIncidentsList: () => Promise.resolve({ collection: [] })
};

const mockActivatedRoute = {
    queryParams: of({}),
    snapshot: {
      paramMap: {
        get: (key: string) => 'some default value'
      }
    }
  };

  // Mock services
const mockAppConfigService = {
    getConfig: () => ({})
};

// Define the default export configuration using Meta
const meta: Meta<IncidentDetailsPanel> = {
    title: 'Components/IncidentDetailsPanel',
    component: IncidentDetailsPanel,
    decorators: [
        moduleMetadata({
            declarations: [IncidentDetailsPanel],
            imports: [
                CommonModule, 
                RouterModule.forChild([]),
                MatDialogModule,
                TextFieldModule
            ],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: PublishedIncidentService, useValue: mockPublishedIncidentService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute } // Providing the mock ActivatedRoute
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<IncidentDetailsPanel>;

// Story for the default desktop view
export const Default: Story = {
    args: {
        incident: {

                aviationComments: "These are avaiation comments",
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
              }
    }
};



