import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WfnewsButtonComponent } from '@app/components/common/wfnews-button/wfnews-button.component';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
  confirmationDialogConfig,
} from './confirmation-dialog.component';

/**
 * The card width and the corner come from the panelClass in
 * styles/component/_confirmation-dialog.scss, so a story must open the dialog through
 * MatDialog. A direct render gives the three bands with no card around them.
 *
 * The button opens it, and the story does not, because autodocs draws every story on one
 * page and four dialogs would then stack in the same overlay.
 */
@Component({
  selector: 'wfnews-confirmation-dialog-story',
  template: `
    <button type="button" (click)="launch()">Open the dialog</button>
  `,
})
class ConfirmationDialogStoryComponent {
  @Input() data: ConfirmationDialogData;

  constructor(private dialog: MatDialog) {}

  launch(): void {
    this.dialog.open(ConfirmationDialogComponent, {
      ...confirmationDialogConfig,
      data: this.data,
    });
  }
}

/**
 * The story binds through a template, not through the component field. Angular 15 gives
 * NgComponentOutlet no inputs, so Storybook cannot pass an arg to a component that it
 * renders that way, and every arg arrives empty.
 */
const meta: Meta<ConfirmationDialogData> = {
  title: 'Dialogs/ConfirmationDialog',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [
        ConfirmationDialogStoryComponent,
        ConfirmationDialogComponent,
        WfnewsButtonComponent,
      ],
      imports: [CommonModule, MatDialogModule, BrowserAnimationsModule],
    }),
  ],
  render: (args) => ({
    props: { data: args },
    template: `
      <wfnews-confirmation-dialog-story [data]="data"></wfnews-confirmation-dialog-story>
    `,
  }),
};

export default meta;
type Story = StoryObj<ConfirmationDialogData>;

/** The words are the ones the screens send, so a story shows what a user sees. */
export const confirm: Story = {
  args: {
    title: 'Confirm Action',
    text: 'Are you sure you want to proceed? If you exit now, your unsaved changes will be lost.',
    confirmButton: 'Exit',
  },
};

// The mark and the confirm button both go red, because the user cannot undo the action.
export const destructive: Story = {
  args: {
    title: 'Delete saved location',
    text: 'You won\'t be able to undo this action',
    confirmButton: 'Delete',
    destructive: true,
  },
};

// A title that wraps. The mark must hold the first line, not the middle of the block.
export const longTitle: Story = {
  args: {
    title: 'Are you sure you want to remove this Wildfire from your Saved Wildfires?',
    text: 'The wildfire stays on the map. Only your saved list changes.',
  },
};

// The phone measure: 411px is a Pixel XL in CSS pixels. The bands lose 8px of padding,
// the mark goes to 20px and the title to 18px. Every rule stays.
export const phone: Story = {
  args: {
    title: 'Confirm Action',
    text: 'Are you sure you want to proceed? If you exit now, your unsaved changes will be lost.',
    confirmButton: 'Exit',
  },
  parameters: {
    viewport: {
      viewports: {
        pixelXl: {
          name: 'Pixel XL',
          styles: { width: '411px', height: '683px' },
          type: 'mobile',
        },
      },
      defaultViewport: 'pixelXl',
    },
  },
};
