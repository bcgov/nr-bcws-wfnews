import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ResourcesRoutes, isMobileView } from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';
import { BUILD_NUMBER } from '../../../../environments/build-info';

@Component({
  selector: 'contact-widget-dialog',
  templateUrl: 'contact-widget-dialog.component.html',
  styleUrls: ['./contact-widget-dialog.component.scss'],
})
export class ContactWidgetDialogComponent implements OnInit {
  // If used as a dialog, set pageMode to false as an input
  // could also pass in as a data object
  @Input() public pageMode = true;
  public contactForm: UntypedFormGroup;
  public contactInformationConfig: any;
  public closeColor;
  public versionNumber;
  public buildNumber: string;
  public showVersion = true; // Flag to track which value to display

  isMobileView = isMobileView;

  constructor(
    private dialogRef: MatDialogRef<ContactWidgetDialogComponent>,
    private snackbarService: MatSnackBar,
    private appConfig: AppConfigService,
    private httpClient: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.appConfig
      .loadAppConfig()
      .then(() => {
        this.contactInformationConfig =
          this.appConfig.getConfig().externalAppConfig['contactInformation'];
      })
      .catch((e) => {
        console.warn('Failed initializing app', e);
      });

    this.contactForm = new UntypedFormGroup({
      name: new UntypedFormControl('', [Validators.required]),
      email: new UntypedFormControl('', [
        Validators.required,
        Validators.email,
      ]),
      subject: new UntypedFormControl(''),
      message: new UntypedFormControl('', [Validators.maxLength(500)]),
    });
    const version = this.appConfig.getConfig().application.version;
    if (version) {
      this.versionNumber = 'Version: ' + version;
    }
    if (BUILD_NUMBER) {
      this.buildNumber = ' Build: ' + BUILD_NUMBER;
    }

  }
  toggleVersionDisplay() {
    this.showVersion = !this.showVersion;
  }

  public error = (controlName: string, errorName: string) => this.contactForm.controls[controlName].hasError(errorName);

  get mailErrorMessages(): string {
    let error = '';
    const emailControl: UntypedFormControl = this.contactForm.get(
      'email',
    ) as UntypedFormControl;

    if (emailControl.hasError('email')) {
error += 'A valid email is required';
}

    return error;
  }

  onSubmit() {
    const url = `${this.appConfig.getConfig().rest['wfnews']}/mail`;

    this.httpClient
      .post(url, {
        '@type': 'MailResource',
        type: 'http://wfnews.nrs.gov.bc.ca/v1/mail',
        name: this.contactForm.get('name').value,
        subject: this.contactForm.get('subject').value,
        emailAddress: this.contactForm.get('email').value,
        messageBody: this.contactForm.get('message').value,
      })
      .toPromise()
      .then(() => {
        this.snackbarService.open(
          'Thank you! Our Team will contact you as soon as possible.',
          null,
          { duration: 10000, panelClass: 'snackbar-success-v2' },
        );
      })
      .catch((err) => {
        this.snackbarService.open(
          'Your request could not be processed at this time. Please try again later.',
          null,
          { duration: 10000, panelClass: 'snackbar-error' },
        );
      });

    if (this.pageMode) {
this.reset();
} else {
this.dialogRef.close();
}
  }

  openMoreInfo(type: string, url: string) {
    window.open(
      `${type === 'tel' ? 'tel:' : ''}${this.contactInformationConfig[url]}`,
      type === 'tel' ? '_self' : '_blank',
    );
  }

  close() {
    this.router.navigate([ResourcesRoutes.MORE]);
  }

  reset() {
    this.contactForm.reset();
  }

  trimSpace(text: string): string {
    return text.replace(/ /g, '').replace('-', '');
  }
}
