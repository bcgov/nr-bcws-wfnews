import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { ContactUsDialogComponent } from './contact-us-dialog.component';
import { AppConfigService } from '@wf1/core-ui';
import { AGOLService } from '@app/services/AGOL-service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

const mockAgolService = {
    getAreaRestrictions: () => Promise.resolve({ collection: [] })
};

const mockAppConfigService = {
    getConfig: () => ({})
};

// Define the default export configuration using Meta
const meta: Meta<ContactUsDialogComponent> = {
    title: 'Components/ContactUsDialogComponent',
    component: ContactUsDialogComponent,
    decorators: [
        moduleMetadata({
            declarations: [ContactUsDialogComponent],
            imports: [
                MatDialogModule,
                MatDialogRef,
                CommonModule
            ],
            providers: [
                { provide: AppConfigService, useValue: mockAppConfigService },
                { provide: AGOLService, useValue: mockAgolService }
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ContactUsDialogComponent>;

export const Default: Story = {
        args: {}
};



