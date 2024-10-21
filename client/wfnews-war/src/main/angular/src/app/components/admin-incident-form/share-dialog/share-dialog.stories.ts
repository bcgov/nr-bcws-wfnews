import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ContactUsCoreComponent } from '@app/components/common/contact-us-core/contact-us-core.component';
import { IconButtonComponent } from '@app/components/common/icon-button/icon-button.component';
import { IconListItemComponent } from '@app/components/common/icon-list-item/icon-list-item.component';
import { ShareDialogComponent } from '@app/components/admin-incident-form/share-dialog/share-dialog.component';

const meta: Meta<ShareDialogComponent> = {
    title: 'Dialogs/ContactUsDialog',
    component: ShareDialogComponent,
    decorators: [
        moduleMetadata({
            declarations: [ShareDialogComponent, ContactUsCoreComponent, IconListItemComponent, IconButtonComponent],
            imports: [
                CommonModule,
                MatDialogModule,
                BrowserAnimationsModule,
            ],
            providers: [
                {
                    provide: MAT_DIALOG_DATA, useValue: {
                        incident: {
                            fireCentreName: 'Prince George Fire Centre',
                            contactEmailAddress: 'BCWS.NorthPeaceComplex.Info@gov.bc.ca',
                            contactPhoneNumber: '778-362-4783'
                        }
                    }
                },
                { provide: MatDialogRef, useValue: {} }
            ]
        }),
    ],
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ShareDialogComponent>;

export const example: Story = {
};
