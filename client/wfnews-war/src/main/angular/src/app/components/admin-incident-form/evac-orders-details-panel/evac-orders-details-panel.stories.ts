import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { EvacOrdersDetailsPanel } from './evac-orders-details-panel.component';
import {
    DefaultService as ExternalUriService,
  } from '@wf1/incidents-rest-api';
import { AGOLService } from '@app/services/AGOL-service';

const mockExternalUriService = {
    getConfig: () => ({})
};

const mockAgolService = {
    getEvacOrders: () => Promise.resolve({ collection: [] })
};

// Define the default export configuration using Meta
const meta: Meta<EvacOrdersDetailsPanel> = {
    title: 'Components/EvacOrdersDetailsPanel',
    component: EvacOrdersDetailsPanel,
    decorators: [
        moduleMetadata({
            declarations: [EvacOrdersDetailsPanel],
            providers: [
                { provide: ExternalUriService, useValue: mockExternalUriService},
                { provide: AGOLService, useValue: mockAgolService}
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<EvacOrdersDetailsPanel>;

export const Default: Story = {
    args: {}
};



