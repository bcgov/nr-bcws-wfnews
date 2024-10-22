import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { IdentifyPanel } from './identify-panel.component';
import { AGOLService } from '@app/services/AGOL-service';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { AppConfigService } from '@wf1/core-ui';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { HttpClient } from '@angular/common/http';
import { MapConfigService } from '@app/services/map-config.service';
import { CommonUtilityService } from '@app/services/common-utility.service';

const mockHttpClient = {
    get: () => ({}),
};

const mockMapService = {
    get: () => ({}),
};

const mockCommonUtilityService = {
    get: () => ({}),
};

const mockAppConfigService = {
    getConfig: () => ({
        externalAppConfig: { evacDefaultUrl: 'http://mock-evac-url.com' },
        mapServices: { openmapsBaseUrl: 'http://mock-map-service-url.com' }
    })
};

const mockAgolService = {
    getAreaRestrictions: () => new Observable()
};

const mockPublishedIncidentService = {
    fetchPublishedIncidentsList: () => Promise.resolve({ collection: [] })
};

const meta: Meta<IdentifyPanel>= {
    title: 'Components/IdentifyPanel',
    component: IdentifyPanel,
    decorators: [
        moduleMetadata({
            declarations: [IdentifyPanel],
            imports: [MatCardModule,
                ReactiveFormsModule,
            ],
            providers: [
                { provide: AGOLService, useValue: mockAgolService },
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: PublishedIncidentService, useValue: mockPublishedIncidentService },
                { provide: HttpClient, useValue: mockHttpClient},
                { provide: MapConfigService, useValue: mockMapService },
                { provide: CommonUtilityService, useValue: mockCommonUtilityService },
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<IdentifyPanel>;

// Story for the default desktop view
export const Default: Story = {
    args: {
        
    }
};


