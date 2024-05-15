// Import necessary Angular modules and decorators
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Import your specific component
import { IncidentHeaderPanel } from './incident-header-panel.component';
import { AppConfigService } from '@wf1/core-ui';
import { WatchlistService } from '@app/services/watchlist-service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { of } from 'rxjs';

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
const meta: Meta<IncidentHeaderPanel> = {
    title: 'Components/Incident Header Panel',
    component: IncidentHeaderPanel,
    decorators: [
        moduleMetadata({
            declarations: [IncidentHeaderPanel],
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
type Story = StoryObj<IncidentHeaderPanel>;

// Story for the default desktop view
export const Default: Story = {
    args: {
        incident: {
            incidentName: 'Severe Wildfire',
            fireOfNoteInd: false,
            stageOfControlCode: 'UNCONTROLLED',
            incidentSizeEstimatedHa: 1500,
            discoveryDate: '2023-05-10',
            updateDate: '2023-05-11',
            declaredOutDate: null,
            fireCentreName: 'Northern Fire Centre',
            latitude: 56.1304,
            longitude: -106.3468,
        },
        evacOrders: [],
        isMobileView: createIsMobileViewOverride(false),
        extent: { ymin: 0, xmin: 0, ymax: 10, xmax: 10 }
    }
};

