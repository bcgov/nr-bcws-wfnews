import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';
import {
  IncidentCauseResource,
  WildfireIncidentResource,
} from '@wf1/incidents-rest-api';
import { PublishedIncidentService } from '../../services/published-incident-service';
import { AreaRestrictionsDetailsPanel } from './area-restrictions-details-panel/area-restrictions-details-panel.component';
import { ContactsDetailsPanel } from './contacts-details-panel/contacts-details-panel.component';
import { EvacOrdersDetailsPanel } from './evac-orders-details-panel/evac-orders-details-panel.component';
import { CustomImageUploader } from './incident-details-panel/custom-uploader';
import { IncidentDetailsPanel } from './incident-details-panel/incident-details-panel.component';
import {
  CauseOptionDisclaimer,
  SizeTypeOptionDisclaimer,
} from './incident-details-panel/incident-details-panel.constants';
import { PublishDialogComponent } from './publish-dialog/publish-dialog.component';

@Directive()
export class AdminIncidentForm implements OnInit, OnChanges {
  // This is a stub used for testing purposes only
  // when an actual resource model is in place, use that
  // and load from the store/api
  @Input() adminIncident: any;
  @Input() adminIncidentCause: any;
  @Output() changesSavedEvent = new EventEmitter<boolean>();
  @ViewChild('detailsPanelComponent')
  detailsPanelComponent: IncidentDetailsPanel;
  @ViewChild('ContactDetailsPanel')
  contactDetailsPanelComponent: ContactsDetailsPanel;
  @ViewChild('EvacOrderPanel') evacOrdersDetailsPanel: EvacOrdersDetailsPanel;
  @ViewChild('AreaRestrictionsPanel')
  areaRestrictionsDetailsPanel: AreaRestrictionsDetailsPanel;

  public Editor = Editor;

  public publishDisabled = false;

  public incident = {
    aviationComments: undefined,
    aviationInd: false,
    cause: 0,
    causeComments: undefined,
    contact: {
      isPrimary: true,
      fireCentre: null,
      phoneNumber: null,
      emailAddress: null,
    },
    crewsComments: undefined,
    evacOrders: [],
    fireName: undefined,
    fireNumber: 0,
    fireOfNote: false,
    wasFireOfNote: false,
    geometry: {
      x: null,
      y: null,
    },
    heavyEquipmentComments: undefined,
    heavyEquipmentInd: false,
    incidentData: null,
    incidentManagementComments: undefined,
    incidentManagementInd: false,
    incidentNumberSequence: 0,
    incidentOverview: '',
    lastPublished: undefined,
    location: undefined,
    mapAttachments: [],
    publishedStatus: 'DRAFT',
    responseComments: undefined,
    responseTypeCode: undefined,
    sizeComments: undefined,
    sizeHectares: 0,
    sizeType: 1,
    stageOfControlCode: undefined,
    structureProtectionComments: undefined,
    structureProtectionInd: false,
    traditionalTerritory: undefined,
    wildfireIncidentGuid: '',
    wildfireYear: new Date().getFullYear(),
    wildifreCrewsInd: false,
    crewResourceCount: undefined,
    aviationResourceCount: undefined,
    heavyEquipmentResourceCount: undefined,
    incidentManagementResourceCount: undefined,
    structureProtectionResourceCount: undefined,
  };

  public readonly incidentForm: UntypedFormGroup;

  wildFireYear: string;
  incidentNumberSequnce: string;
  currentAdminIncident: WildfireIncidentResource;
  currentAdminIncidentCause: IncidentCauseResource;
  publishedIncidentType: string;
  publishedIncidentDetailGuid: string;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private router: ActivatedRoute,
    private componentRouter: Router,
    protected cdr: ChangeDetectorRef,
    protected dialog: MatDialog,
    private publishedIncidentService: PublishedIncidentService,
    protected snackbarService: MatSnackBar,
    protected http: HttpClient,
  ) {
    this.incidentForm = this.formBuilder.group({
      aviationComments: [],
      aviationInd: [],
      cause: [],
      causeComments: [],
      contact: this.formBuilder.group({
        fireCentre: [],
        phoneNumber: new UntypedFormControl('', [
          Validators.pattern(
            /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/,
          ),
        ]),
        emailAddress: new UntypedFormControl('', [
          Validators.pattern(
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
          ),
        ]),
      }),
      crewsComments: [],
      evacOrders: this.formBuilder.array([]),
      fireName: [],
      fireOfNote: [],
      wasFireOfNote: [],
      heavyEquipmentComments: [],
      heavyEquipmentInd: [],
      incidentLocation: [],
      incidentManagementComments: [],
      incidentManagementInd: [],
      incidentNumberSequence: [],
      incidentSituation: [],
      lastPublished: [],
      location: [],
      publishedStatus: [],
      responseComments: [],
      sizeComments: [],
      sizeHectares: [],
      sizeType: [],
      structureProtectionComments: [],
      structureProtectionInd: [],
      traditionalTerritory: [],
      wildifreCrewsInd: [],
      crewResourceCount: [],
      aviationResourceCount: [],
      heavyEquipmentResourceCount: [],
      incidentManagementResourceCount: [],
      structureProtectionResourceCount: [],
    });

    this.incidentForm.valueChanges.subscribe(() => {
      this.setIsFormDirty(this.incidentForm.dirty);
    });
  }

  setIsFormDirty(isDirty: boolean) {
    this.changesSavedEvent.emit(!isDirty);
  }

  getPublishedDate() {
    return this.incident.lastPublished
      ? new Date(this.incident.lastPublished)
      : new Date(0);
  }

  validFormCheck() {
    const contactControl = this.incidentForm.get('contact');
    return (
      contactControl.get('emailAddress').hasError('required') ||
      contactControl.get('emailAddress').hasError('pattern') ||
      contactControl.get('phoneNumber').hasError('required') ||
      contactControl.get('phoneNumber').hasError('pattern')
    );
  }

  ngOnInit() {
    this.router.queryParams.subscribe((params: ParamMap) => {
      if (
        params &&
        params['wildFireYear'] &&
        params['incidentNumberSequence']
      ) {
        this.wildFireYear = params['wildFireYear'];
        this.incidentNumberSequnce = params['incidentNumberSequence'];

        const self = this;

        this.publishedIncidentService
          .fetchIMIncident(this.wildFireYear, this.incidentNumberSequnce)
          .subscribe(
            (incidentResponse) => {
              self.currentAdminIncident = incidentResponse.response;
              this.publishedIncidentType = self.currentAdminIncident.type;
              (self.incident as any).discoveryDate = new Date(
                self.currentAdminIncident.discoveryTimestamp,
              ).toLocaleString();
              (self.incident as any).fireCentreOrgUnitName =
                self.currentAdminIncident.fireCentreOrgUnitName;
              (self.incident as any).incidentStatusCode =
                self.currentAdminIncident.incidentStatusCode;
              self.incident.incidentData = self.currentAdminIncident;
              self.incident.geometry.x =
                self.currentAdminIncident.incidentLocation.longitude;
              self.incident.geometry.y =
                self.currentAdminIncident.incidentLocation.latitude;
              self.incident.fireNumber =
                self.currentAdminIncident.incidentNumberSequence;
              self.incident.wildfireYear =
                self.currentAdminIncident.wildfireYear;
              self.incident.fireOfNote =
                self.currentAdminIncident.fireOfNotePublishedInd;
              self.incident.wasFireOfNote =
                self.currentAdminIncident.wasFireOfNotePublishedInd;
              self.incident.incidentNumberSequence =
                self.currentAdminIncident.incidentNumberSequence;
              self.incident.fireName =
                self.currentAdminIncident.incidentName ||
                self.currentAdminIncident.incidentLabel;
              self.incident.publishedStatus = 'DRAFT';
              self.incident.location =
                self.currentAdminIncident.incidentLocation.geographicDescription;
              self.incident.wildfireIncidentGuid =
                self.currentAdminIncident.wildfireIncidentGuid;

              self.incident.sizeType = 2;
              self.incident.sizeHectares =
                self.currentAdminIncident.incidentSituation.fireSizeHectares;
              self.incident.sizeComments =
                'Fire size is based on most current information available.';

              self.detailsPanelComponent.setCauseDisclaimer(
                self.incident.cause,
              );
              self.incident.causeComments =
                self.detailsPanelComponent.causeOptions.find(
                  (c) => c.id === self.incident.cause,
                ).disclaimer;

              self.incident.contact.isPrimary = true;

              self.incident.contact.fireCentre =
                self.currentAdminIncident.fireCentreOrgUnitIdentifier;

              self.incident.responseTypeCode = self.currentAdminIncident.responseTypeCode;

              this.areaRestrictionsDetailsPanel.getAreaRestrictions();

              this.http
                .get('../../../../assets/data/fire-center-contacts-agol.json')
                .subscribe((data) => {
                  self.incident.contact.phoneNumber =
                    data[self.incident.contact.fireCentre].phone;
                  self.incident.contact.emailAddress =
                    data[self.incident.contact.fireCentre].url;
                  this.incidentForm.patchValue(this.incident);
                  this.cdr.detectChanges();
                });

              incidentResponse.getPublishedIncident.subscribe(
                (response) => {
                  self.publishedIncidentDetailGuid =
                    response.publishedIncidentDetailGuid;
                  self.incident.traditionalTerritory =
                    response.traditionalTerritoryDetail;
                  self.incident.lastPublished = response.publishedTimestamp;
                  self.incident.location = response.incidentLocation;

                  self.incident.sizeComments =
                    response.incidentSizeDetail ||
                    'Fire size is based on most current information available.';
                  Object.entries(SizeTypeOptionDisclaimer).forEach(
                    ([index, disclaimer]) => {
                      if (disclaimer === response.incidentSizeDetail) {
                        self.incident.sizeType = Number.parseInt(index, 10);
                      }
                    },
                  );

                  self.incident.cause = 0;
                  self.incident.causeComments = response.incidentCauseDetail;
                  Object.entries(CauseOptionDisclaimer).forEach(
                    ([index, disclaimer]) => {
                      if (disclaimer === response.incidentCauseDetail) {
                        self.incident.cause = Number.parseInt(index, 10);
                      }
                    },
                  );
                  if (!response.incidentCauseDetail) {
                    self.incident.causeComments = CauseOptionDisclaimer[0];
                  }

                  self.incident.publishedStatus =
                    response.newsPublicationStatusCode;
                  self.incident.responseComments = response.resourceDetail;

                  self.incident.wildifreCrewsInd =
                    response.wildfireCrewResourcesInd;
                  self.incident.crewsComments =
                    response.wildfireCrewResourcesDetail;

                  self.incident.aviationInd =
                    response.wildfireAviationResourceInd;
                  self.incident.aviationComments =
                    response.wildfireAviationResourceDetail;

                  self.incident.incidentManagementInd =
                    response.incidentMgmtCrewRsrcInd;
                  self.incident.incidentManagementComments =
                    response.incidentMgmtCrewRsrcDetail;
                  self.incident.heavyEquipmentInd =
                    response.heavyEquipmentResourcesInd;
                  self.incident.heavyEquipmentComments =
                    response.heavyEquipmentResourcesDetail;
                  self.incident.structureProtectionInd =
                    response.structureProtectionRsrcInd;
                  self.incident.structureProtectionComments =
                    response.structureProtectionRsrcDetail;

                  self.incident.crewResourceCount =
                    response?.crewResourceCount || undefined;
                  self.incident.aviationResourceCount =
                    response?.aviationResourceCount || undefined;
                  self.incident.heavyEquipmentResourceCount =
                    response?.heavyEquipmentResourceCount || undefined;
                  self.incident.incidentManagementResourceCount =
                    response?.incidentManagementResourceCount || undefined;
                  self.incident.structureProtectionResourceCount =
                    response?.structureProtectionResourceCount || undefined;

                  self.incident.contact.fireCentre =
                    response.contactOrgUnitIdentifer?.toString();
                  self.incident.contact.phoneNumber =
                    response.contactPhoneNumber;
                  self.incident.contact.emailAddress =
                    response.contactEmailAddress;
                  self.incident.incidentOverview = response.incidentOverview;

                  this.incidentForm.patchValue(this.incident);
                  this.incidentForm.markAsPristine();
                  this.evacOrdersDetailsPanel.getEvacOrders();
                },
                (error) => {
                  console.log('No published data found...');
                  console.error(error);
                  self.publishedIncidentDetailGuid = null;
                },
              );

              this.incidentForm.patchValue(this.incident);
              this.incidentForm.markAsPristine();
              this.cdr.detectChanges();
            },
            (incidentResponseError) => {
              console.error(incidentResponseError);
              this.snackbarService.open(
                'Failed to fetch Incident: ' +
                JSON.stringify(incidentResponseError),
                'OK',
                { duration: 10000, panelClass: 'snackbar-error' },
              );
            },
          );
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // TODO: This can be removed once the onInit is updated to map the form correctly
  }

  nullEmptyStrings(value: string) {
    return !value ? null : value;
  }

  async publishChanges() {
    this.publishDisabled = true;
    this.cdr.detectChanges();
    const self = this;
    const dialogRef = this.dialog.open(PublishDialogComponent, {
      width: '350px',
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (!result?.publish) {
      this.publishDisabled = false;
      this.cdr.detectChanges();
      return;
    }

    const publishedIncidentResource = {
      contactEmailAddress: this.nullEmptyStrings(
        this.incident.contact.emailAddress,
      ),
      contactOrgUnitIdentifer: this.incident.contact.fireCentre,
      contactPhoneNumber: this.nullEmptyStrings(
        this.incident.contact.phoneNumber,
      ),
      discoveryDate: new Date().valueOf().toString(),
      fireOfNoteInd: this.incident.fireOfNote,
      wasFireOfNoteInd: this.incident.wasFireOfNote,
      heavyEquipmentResourcesDetail: this.nullEmptyStrings(
        this.incident.heavyEquipmentComments,
      ),
      heavyEquipmentResourcesInd: this.incident.heavyEquipmentInd,
      incidentCauseDetail: this.nullEmptyStrings(this.incident.causeComments),
      incidentGuid: this.currentAdminIncident['wildfireIncidentGuid'],
      incidentLocation: this.nullEmptyStrings(this.incident.location),
      incidentMgmtCrewRsrcDetail: this.nullEmptyStrings(
        this.incident.incidentManagementComments,
      ),
      incidentMgmtCrewRsrcInd: this.incident.incidentManagementInd,
      incidentName: this.incident.fireName,
      incidentOverview: this.nullEmptyStrings(this.incident.incidentOverview),
      incidentSizeDetail: this.nullEmptyStrings(this.incident.sizeComments),
      newsCreatedTimestamp: new Date().valueOf().toString(),
      newsPublicationStatusCode: 'PUBLISHED',
      publishedIncidentDetailGuid: this.publishedIncidentDetailGuid,
      publishedTimestamp: new Date(),
      resourceDetail: this.nullEmptyStrings(this.incident.responseComments),
      responseTypeCode: this.nullEmptyStrings(this.incident.responseTypeCode),
      structureProtectionRsrcDetail: this.nullEmptyStrings(
        this.incident.structureProtectionComments,
      ),
      structureProtectionRsrcInd: this.incident.structureProtectionInd,
      traditionalTerritoryDetail: this.nullEmptyStrings(
        this.incident.traditionalTerritory,
      ),
      type: this.publishedIncidentType,
      wildfireAviationResourceDetail: this.nullEmptyStrings(
        this.incident.aviationComments,
      ),
      wildfireAviationResourceInd: this.incident.aviationInd,
      wildfireCrewResourcesDetail: this.nullEmptyStrings(
        this.incident.crewsComments,
      ),
      wildfireCrewResourcesInd: this.incident.wildifreCrewsInd,
      crewResourceCount: this.incident.crewResourceCount,
      aviationResourceCount: this.incident.aviationResourceCount,
      heavyEquipmentResourceCount: this.incident.heavyEquipmentResourceCount,
      incidentManagementResourceCount:
        this.incident.incidentManagementResourceCount,
      structureProtectionResourceCount:
        this.incident.structureProtectionResourceCount,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@type': 'http://wfim.nrs.gov.bc.ca/v1/publishedIncident',
    };

    try {
      const doc = await self.publishIncident(publishedIncidentResource);
      this.publishedIncidentDetailGuid = doc.publishedIncidentDetailGuid;

      // Handle evac orders
      await this.evacOrdersDetailsPanel.persistEvacOrders();

      this.snackbarService.open('Incident Published Successfully', 'OK', {
        duration: 100000,
        panelClass: 'snackbar-success-v2',
      });

      // Update the Draft/Publish status on incident name
      this.incident.lastPublished = doc.publishedTimestamp;
      this.incident.publishedStatus = doc.newsPublicationStatusCode;
      this.incidentForm.markAsPristine();
      this.setIsFormDirty(false);
    } catch (err) {
      this.snackbarService.open(
        'Failed to Publish Incident: ' + JSON.stringify(err.message),
        'OK',
        { duration: 10000, panelClass: 'snackbar-error' },
      );
    } finally {
      self.publishDisabled = false;
      this.cdr.detectChanges();
    }
  }

  publishIncident(incident): Promise<any> {
    return this.publishedIncidentService
      .saveIMPublishedIncident(incident)
      .toPromise();
  }

  onShowPreview() {
    const mappedIncident = {
      contactEmailAddress: (
        this.incidentForm.controls['contact'] as UntypedFormGroup
      ).controls['emailAddress'].value,
      contactOrgUnitIdentifer: (
        this.incidentForm.controls['contact'] as UntypedFormGroup
      ).controls['fireCentre'].value,
      contactPhoneNumber: (
        this.incidentForm.controls['contact'] as UntypedFormGroup
      ).controls['phoneNumber'].value,
      discoveryDate: new Date(
        this.incident.incidentData.discoveryTimestamp,
      ).toString(),
      fireCentre: this.currentAdminIncident.fireCentreOrgUnitIdentifier,
      fireOfNoteInd: this.incidentForm.controls['fireOfNote'].value,
      wasFireOfNoteInd: this.incidentForm.controls['wasFireOfNote'].value,
      fireYear: this.incident.wildfireYear,
      generalIncidentCauseCatId: this.incidentForm.controls['cause'].value,
      heavyEquipmentResourcesDetail:
        this.incidentForm.controls['heavyEquipmentComments'].value,
      heavyEquipmentResourcesInd:
        this.incidentForm.controls['heavyEquipmentInd'].value,
      incidentCauseDetail: this.incidentForm.controls['causeComments'].value,
      incidentGuid: this.currentAdminIncident['wildfireIncidentGuid'],
      incidentLocation:
        this.incidentForm.controls['location'].value ||
        this.currentAdminIncident.incidentLocation.geographicDescription,
      incidentMgmtCrewRsrcDetail:
        this.incidentForm.controls['incidentManagementComments'].value,
      incidentMgmtCrewRsrcInd:
        this.incidentForm.controls['incidentManagementInd'].value,
      incidentName: this.incidentForm.controls['fireName'].value,
      incidentNumberLabelFull: this.currentAdminIncident.incidentLabel,
      incidentOverview: this.incident.incidentOverview,
      incidentSizeDetail: this.incidentForm.controls['sizeComments'].value,
      incidentSizeEstimatedHa: this.incidentForm.controls['sizeHectares'].value,
      incidentSizeType: this.incidentForm.controls['sizeType'].value,
      lastUpdatedTimestamp: new Date(
        this.incident.incidentData.lastUpdatedTimestamp,
      ).toString(),
      latitude: this.incident.incidentData.incidentLocation.latitude,
      longitude: this.incident.incidentData.incidentLocation.longitude,
      resourceDetail: this.incidentForm.controls['responseComments'].value,
      stageOfControlCode:
        this.currentAdminIncident.incidentSituation.stageOfControlCode,
      structureProtectionRsrcDetail:
        this.incidentForm.controls['structureProtectionComments'].value,
      structureProtectionRsrcInd:
        this.incidentForm.controls['structureProtectionInd'].value,
      traditionalTerritoryDetail:
        this.incidentForm.controls['traditionalTerritory'].value,
      wildfireAviationResourceDetail:
        this.incidentForm.controls['aviationComments'].value,
      wildfireAviationResourceInd:
        this.incidentForm.controls['aviationInd'].value,
      wildfireCrewResourcesDetail:
        this.incidentForm.controls['crewsComments'].value,
      wildfireCrewResourcesInd:
        this.incidentForm.controls['wildifreCrewsInd'].value,
      crewResourceCount: this.incident.crewResourceCount || undefined,
      aviationResourceCount: this.incident.aviationResourceCount || undefined,
      heavyEquipmentResourceCount:
        this.incident.heavyEquipmentResourceCount || undefined,
      incidentManagementResourceCount:
        this.incident.incidentManagementResourceCount || undefined,
      structureProtectionResourceCount:
        this.incident.structureProtectionResourceCount || undefined,
    };

    if (localStorage.getItem('preview_incident') != null) {
      localStorage.removeItem('preview_incident');
    }

    localStorage.setItem('preview_incident', JSON.stringify(mappedIncident));

    const url = this.componentRouter.serializeUrl(
      this.componentRouter.createUrlTree(['incidents'], {
        queryParams: { preview: true },
      }),
    );

    window.open(url, '_blank');
  }

  // for decoupled editor
  public onReady(editor) {
    editor.ui
      .getEditableElement()
      .parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement(),
      );

    editor.plugins.get('FileRepository').createUploadAdapter = (loader) =>
      new CustomImageUploader(loader);
  }
}
