import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { PublishDialogComponent } from './publish-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const meta: Meta<PublishDialogComponent> = {
    title: 'Components/PublishDialogComponent',
    component: PublishDialogComponent,
    decorators: [
        moduleMetadata({
            declarations: [PublishDialogComponent],
            imports: [
                CommonModule,
                MatDialogModule,
                BrowserAnimationsModule
            ],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} }
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<PublishDialogComponent>;

export const Default: Story = {};



