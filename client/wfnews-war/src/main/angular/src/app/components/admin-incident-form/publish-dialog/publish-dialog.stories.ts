import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { PublishDialogComponent } from './publish-dialog.component';
import { AGOLService } from '@app/services/AGOL-service';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

const mockAgolService = {
    getEvacOrders: () => Promise.resolve({ collection: [] })
};

// Define the default export configuration using Meta
const meta: Meta<PublishDialogComponent> = {
    title: 'Components/PublishDialogComponent',
    component: PublishDialogComponent,
    decorators: [
        moduleMetadata({
            declarations: [PublishDialogComponent],
            imports: [ MatDialogRef,
                       CommonModule
            ],
            providers: [
                { provide: AGOLService, useValue: mockAgolService}
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<PublishDialogComponent>;

export const Default: Story = {
    args: {}
};



