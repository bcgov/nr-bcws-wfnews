import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { SummaryPanel } from './summary-panel.component';
import {
    DefaultService as ExternalUriService,
  } from '@wf1/incidents-rest-api';
import { AGOLService } from '@app/services/AGOL-service';
import { MatDialogRef } from '@angular/material/dialog';

const mockExternalUriService = {
    getConfig: () => ({})
};

const mockAgolService = {
    getEvacOrders: () => Promise.resolve({ collection: [] })
};

// Define the default export configuration using Meta
const meta: Meta<SummaryPanel> = {
    title: 'Components/SummaryPanel',
    component: SummaryPanel,
    decorators: [
        moduleMetadata({
            declarations: [SummaryPanel],
            imports: [ MatDialogRef ],
            providers: [
                { provide: ExternalUriService, useValue: mockExternalUriService},
                { provide: AGOLService, useValue: mockAgolService}
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<SummaryPanel>;

export const Default: Story = {
    args: {}
};



