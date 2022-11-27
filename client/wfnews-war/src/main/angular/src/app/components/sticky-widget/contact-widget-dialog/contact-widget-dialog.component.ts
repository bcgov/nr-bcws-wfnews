import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfigService } from '@wf1/core-ui';

@Component({
    selector: 'contact-widget-dialog',
    templateUrl: 'contact-widget-dialog.component.html',
    styleUrls: ['./contact-widget-dialog.component.scss']
})
export class ContactWidgetDialogComponent implements OnInit {

    public contactForm: FormGroup;
    contactInformationConfig: any;

    constructor (
      private dialogRef: MatDialogRef<ContactWidgetDialogComponent>,
      private snackbarService: MatSnackBar,
      private appConfig: AppConfigService,
      private httpClient: HttpClient
    ) {}

    ngOnInit() {
        this.appConfig.loadAppConfig()
            .then(() => {
                this.contactInformationConfig = this.appConfig.getConfig().externalAppConfig['contactInformation'];
            })
            .catch((e) => {
                console.warn('Failed initializing app', e);
            });

        this.contactForm = new FormGroup({
            name: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
            subject: new FormControl('', [Validators.required]),
            message: new FormControl('', [Validators.required, Validators.maxLength(500)])
        });
    }

    public error = (controlName: string, errorName: string) =>{
        return this.contactForm.controls[controlName].hasError(errorName);
    }

    get mailErrorMessages(): string {
        let error = "";
        const emailControl: FormControl = (this.contactForm.get('email') as FormControl);

        if(emailControl.hasError('required'))
            error += "Email is required";
        if(emailControl.hasError('email'))
            error += "A valid email is required";

        return error;
     }

    onSubmit() {
        //TODO: send to email API
        this.dialogRef.close();
        const url = `${this.appConfig.getConfig().rest['wfnews']}/mail`;

        this.httpClient.post(url, {
          "@type": 'MailResource',
          "type": 'http://wfnews.nrs.gov.bc.ca/v1/mail',
          name: this.contactForm.get('name').value,
          subject: this.contactForm.get('subject').value,
          emailAddress: this.contactForm.get('email').value,
          messageBody: this.contactForm.get('message').value
        }).toPromise().then(() => {
          this.snackbarService.open('Thank you! Our Team will contact you as soon as possible.', null, { duration: 10000, panelClass: 'snackbar-success-v2' });
        }).catch(err => {
          this.snackbarService.open('Your request could not be processed at this time. Please try again later.', null, { duration: 10000, panelClass: 'snackbar-error' });
        })
    }
}
