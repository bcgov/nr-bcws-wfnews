import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';

import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WfnewsButtonComponent } from '@app/components/common/wfnews-button/wfnews-button.component';
import { ShareDialogComponent } from '@app/components/admin-incident-form/share-dialog/share-dialog.component';

const meta: Meta<ShareDialogComponent> = {
    title: 'Dialogs/ShareDialog',
    component: ShareDialogComponent,
    decorators: [
        moduleMetadata({
            declarations: [ShareDialogComponent, WfnewsButtonComponent],
            imports: [
                CommonModule,
                MatDialogModule,
                BrowserAnimationsModule,
            ],
            providers: [
                {
                  provide: MAT_DIALOG_DATA, useValue: {
                    name: 'Crater Creek Wildfire',  // Example incident name
                    currentUrl: 'https://wildfiresituation.nrs.gov.bc.ca/incidents?fireYear=2024&incidentNumber=K62650&source=list'
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
