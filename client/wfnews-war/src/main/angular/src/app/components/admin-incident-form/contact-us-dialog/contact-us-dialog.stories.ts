import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { ContactUsDialogComponent } from './contact-us-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const meta: Meta<ContactUsDialogComponent> = {
    title: 'Components/ContactUsDialogComponent',
    component: ContactUsDialogComponent,
    decorators: [
        moduleMetadata({
            declarations: [ContactUsDialogComponent],
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

type Story = StoryObj<ContactUsDialogComponent>;

export const Default: Story = {};



