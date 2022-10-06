import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ContactWidgetDialogComponent } from './contact-widget-dialog/contact-widget-dialog.component';

@Component({
    selector: 'contact-widget',
    templateUrl: 'contact-widget.component.html',
    styleUrls: ['./contact-widget.component.scss']
})
export class ContactWidgetComponent {

    constructor(protected dialog: MatDialog){}
    openContactForm() {
        this.dialog.open(ContactWidgetDialogComponent, {
          width: '950px',
        });
      }
}
