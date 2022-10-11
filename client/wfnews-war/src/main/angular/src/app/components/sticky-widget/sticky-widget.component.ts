import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContactWidgetDialogComponent } from './contact-widget-dialog/contact-widget-dialog.component';

@Component({
    selector: 'sticky-widget',
    templateUrl: 'sticky-widget.component.html',
    styleUrls: ['./sticky-widget.component.scss']
})
export class StickyWidgetComponent {

    constructor(protected dialog: MatDialog){}
    openContactForm() {
        this.dialog.open(ContactWidgetDialogComponent, {
          width: '950px',
        });
      }
}
