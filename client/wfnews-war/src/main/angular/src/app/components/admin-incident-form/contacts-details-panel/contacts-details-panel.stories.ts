import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { ContactsDetailsPanel } from './contacts-details-panel.component';
import { HttpClient } from '@angular/common/http';

const mockHttpClient = {
    getConfig: () => ({})
};

// Define the default export configuration using Meta
const meta: Meta<ContactsDetailsPanel> = {
    title: 'Components/ContactsDetailsPanel',
    component: ContactsDetailsPanel,
    decorators: [
        moduleMetadata({
            declarations: [ContactsDetailsPanel],
            providers: [
                { provide: HttpClient, useValue: mockHttpClient}
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ContactsDetailsPanel>;

export const Default: Story = {
    args: {}
};



