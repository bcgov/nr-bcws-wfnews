import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { moduleMetadata, type Meta } from '@storybook/angular';
import { UnsavedChangesDialog } from './unsaved-changes-dialog.component';

@Component({
  template: `
    <button mat-raised-button color="primary" (click)="launch()">Open Dialog</button>
  `
})
class LaunchDialogComponent {
  @Input() width = '';
  constructor(private _dialog: MatDialog) { }

  launch(): void {
    this._dialog.open(UnsavedChangesDialog, {
        autoFocus: false,
        width: this.width,
    });
  }
}

const meta: Meta<LaunchDialogComponent> = {
  title: 'Dialogs/UnsavedChangesDialog',
  component: LaunchDialogComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      declarations: [UnsavedChangesDialog],
      imports: [MatDialogModule, MatButtonModule],
    }),
  ],
};

export default meta;

const template = (args: LaunchDialogComponent) => ({
  props: args,
});

export const primary = template.bind({});
primary.args = {
    width: '450px'
};
