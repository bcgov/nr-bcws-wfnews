// Import necessary Angular modules and decorators
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

// Import your specific component
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { WatchlistService } from '@app/services/watchlist-service';
import { AppConfigService } from '@wf1/core-ui';
import { of } from 'rxjs';
import { IncidentHeaderPanelComponent } from './incident-header-panel.component';

// Mock services
const mockAppConfigService = {
    getConfig: () => ({
        externalAppConfig: { evacDefaultUrl: 'http://mock-evac-url.com' },
        mapServices: { openmapsBaseUrl: 'http://mock-map-service-url.com' }
    })
};

const mockWatchlistService = {
    getWatchlist: () => [],
    saveToWatchlist: () => {},
    removeFromWatchlist: () => {}
};

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

// Define the default export configuration using Meta
const meta: Meta<IncidentHeaderPanelComponent> = {
    title: 'Components/IncidentHeaderPanel',
    component: IncidentHeaderPanelComponent,
    decorators: [
        moduleMetadata({
            declarations: [IncidentHeaderPanelComponent],
            imports: [
                CommonModule, 
                RouterModule.forChild([]),
                MatDialogModule,
                BrowserAnimationsModule
            ],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: WatchlistService, useValue: mockWatchlistService },
                { provide: PublishedIncidentService, useValue: mockPublishedIncidentService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute } // Providing the mock ActivatedRoute
            ]
        }),
    ],
    tags: ['autodocs'],
};


export default meta;

// Helper function to override the isMobileView method
function createIsMobileViewOverride(isMobile: boolean): () => boolean {
    return () => isMobile;
}

// Define the type for Story Object
type Story = StoryObj<IncidentHeaderPanelComponent>;

// Story for the default desktop view
export const Default: Story = {
    args: {
        incident: {
            publishedIncidentDetailGuid: "8e82dd07-9052-4754-8663-fa1ef9d2b81a",
            incidentGuid: "185EB1F9353E5714E0631D09228E7691",
            "incidentNumberLabel": "K45052",
            "newsCreatedTimestamp": 1715640724000,
            "stageOfControlCode": "OUT_CNTRL",
            "generalIncidentCauseCatId": 3,
            "newsPublicationStatusCode": "PUBLISHED",
            "discoveryDate": 1715640724000,
            "declaredOutDate": null,
            "fireCentreCode": "25",
            "fireCentreName": "Kamloops Fire Centre",
            "fireOfNoteInd": false,
            "wasFireOfNoteInd": false,
            "incidentName": "K45052",
            "incidentLocation": "ABCDE demo!!",
            "traditionalTerritoryDetail": null,
            "incidentSizeEstimatedHa": 0.0,
            "incidentSizeMappedHa": 0.0,
            "incidentSizeDetail": "Fire size is based on most current information available.",
            "incidentCauseDetail": "A wildfire of undetermined cause, including a wildfire that is currently under investigation, as well as one where the investigation has been completed.",
            "wildfireCrewResourcesInd": false,
            "wildfireAviationResourceInd": false,
            "heavyEquipmentResourcesInd": false,
            "incidentMgmtCrewRsrcInd": false,
            "structureProtectionRsrcInd": false,
            "crewResourceCount": null,
            "aviationResourceCount": null,
            "heavyEquipmentResourceCount": null,
            "incidentManagementResourceCount": null,
            "structureProtectionResourceCount": null,
            "publishedTimestamp": 1715705624890,
            "lastUpdatedTimestamp": 1715705624889,
            "createDate": 1715640726237,
            "updateDate": 1715705624891,
            "latitude": "50.712172",
            "longitude": "-119.457848",
            "fireYear": 2024,
            "responseTypeCode": null,
            "responseTypeDetail": null,
            "fireZoneUnitIdentifier": 29,
            "incidentOverview": null,
            "incidentSizeType": "Mapped",
            "contactOrgUnitIdentifer": 25,
            "contactPhoneNumber": "250-554-5965",
            "contactEmailAddress": "KFCINFO@gov.bc.ca",
            "resourceDetail": null,
            "wildfireCrewResourcesDetail": null,
            "wildfireAviationResourceDetail": null,
            "heavyEquipmentResourcesDetail": null,
            "incidentMgmtCrewRsrcDetail": null,
            "structureProtectionRsrcDetail": null,
            "publishedUserTypeCode": null,
            "publishedUserGuid": null,
            "publishedUserUserId": null,
            "publishedUserName": null,
            "publishedIncidentRevisionCount": 7,
            "createUser": "SCL\\WFNEWS_SYNC",
            "updateUser": "SCL\\WFNEWS_SYNC",
        },
        evacOrders: [],
        isMobileView: createIsMobileViewOverride(false),
        extent: { ymin: 0, xmin: 0, ymax: 10, xmax: 10 }
    }
};

