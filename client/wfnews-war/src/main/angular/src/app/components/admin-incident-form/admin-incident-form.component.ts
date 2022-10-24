import { ChangeDetectorRef,  Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppConfigService } from '@wf1/core-ui';
import { IncidentCauseResource, WildfireIncidentResource, PublishedIncidentResource } from '@wf1/incidents-rest-api';
import { getIncident } from '../../store/incident/incident.action';
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';
import { CustomImageUploader } from './incident-details-panel/custom-uploader';
import { RootState } from '../../store';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublishDialogComponent } from './publish-dialog/publish-dialog.component';
import { PublishedIncidentService } from '../../services/published-incident-service';

@Directive()
export class AdminIncidentForm implements OnInit, OnChanges {
  // This is a stub used for testing purposes only
  // when an actual resource model is in place, use that
  // and load from the store/api
  @Input() adminIncident: any;
  @Input() adminIncidentCause: any;

  public Editor = Editor;

  // TODO: Remove the default values here.
  
  public incident = {
    fireNumber: 0,
    wildfireYear: 2022,
    incidentNumberSequence: 0,
    fireName: 'This is a Test',
    traditionalTerritory: 'Tsawassen',
    lastPublished: new Date(),
    publishedStatus: 'Published',
    fireOfNote: 'Y',
    location: 'Some place, some time, who knows',
    sizeType: 1,
    sizeHectares: 987,
    sizeComments: '',
    cause: 'Lightning',
    stageOfControlCode: "",
    causeComments: '',
    responseComments: '',
    wildifreCrewsInd: true,
    crewsComments: '',
    aviationInd: true,
    aviationComments: '',
    incidentManagementInd: true,
    incidentManagementComments: '',
    heavyEquipmentInd: true,
    heavyEquipmentComments: '',
    structureProtectionInd: true,
    structureProtectionComments: '',
    contact: {
      isPrimary: true,
      fireCentre: null,
      phoneNumber: '1231231233',
      emailAddress: 'email@address.com'
    },
    geometry: {
      x: -115,
      y: 50
    },
    incidentOverview: '',
    evacOrders: [],
    mapAttachments: [],
    incidentData: null
  }
  

  wildFireYear: string;
  incidentNumberSequnce: string;
  currentAdminIncident: WildfireIncidentResource;
  currentAdminIncidentCause: IncidentCauseResource;
  publishedIncidentType: string;

  private loaded = false;

  public readonly incidentForm: FormGroup

  constructor(private readonly formBuilder: FormBuilder,
              private router: ActivatedRoute,
              private componentRouter: Router,
              private store: Store<RootState>,
              protected cdr: ChangeDetectorRef,
              protected dialog: MatDialog,
              private publishedIncidentService: PublishedIncidentService,
              protected snackbarService: MatSnackBar) {
    this.incidentForm = this.formBuilder.group({
      fireName: [],
      incidentNumberSequence: [],
      incidentLocation:[],
      traditionalTerritory: [],
      lastPublished: [],
      publishedStatus: [],
      fireOfNote: [],
      location: [],
      sizeType: [],
      sizeHectares: [],
      incidentSituation: [],
      sizeComments: [],
      cause: [],
      causeComments: [],
      responseComments:[],
      wildifreCrewsInd: [],
      crewsComments: [],
      aviationInd: [],
      aviationComments: [],
      incidentManagementInd: [],
      incidentManagementComments: [],
      heavyEquipmentInd: [],
      heavyEquipmentComments: [],
      structureProtectionInd: [],
      structureProtectionComments: [],
      contact: this.formBuilder.group({
        fireCentre: [],
        phoneNumber: [],
        emailAddress: []
      }),
      evacOrders: this.formBuilder.array([])
    })
  }

  ngOnInit() {
    this.router.queryParams.subscribe(
      (params:ParamMap) => {
        if (params && params['wildFireYear'] && params['incidentNumberSequence']){
          this.wildFireYear = params['wildFireYear'];
          this.incidentNumberSequnce = params['incidentNumberSequence']
          // TODO: using teh publishedIncidentService means we can get rid of the store dispatch and not use ngrx at all
          // this.store.dispatch(getIncident(this.wildFireYear, this.incidentNumberSequnce))

          this.publishedIncidentService.fetchIMIncident(this.wildFireYear, this.incidentNumberSequnce).then((result) => {
            // TODO: The result object contains two things:
            // result.incident is the source wildfire incident from IM
            // result.published is the published incident information. If there is no published incident
            // this will be undefined.
            // So, in this function here, we should be determining what data to push to the form by using the published
            // incident if available, or "creating" one from the wildfire incident if one doesn't exist.
            console.log(result)
            // create the published incident if its undefined.
            this.currentAdminIncident = result.incident // should be the published incident (not needed?)
            this.incident = result.incident // should be the published incident
            this.incidentForm.patchValue(this.incident) // populate the form

            this.cdr.detectChanges();
          }).catch((err) => {
            console.error(err)
          })
        }
      }
    )
  }

  ngOnChanges(changes: SimpleChanges) {
    // TODO: This can be removed once the onInit is updated to map the form correctly
    if (changes.adminIncident && changes.adminIncident.currentValue){
      this.currentAdminIncident = changes.adminIncident.currentValue
      var self = this;

      this.publishedIncidentService.getPublishedIncident(this.currentAdminIncident["wildfireIncidentGuid"]).subscribe( (response) => {
        let publishedIncident = response;
        this.publishedIncidentType = publishedIncident.type;
        self.incident.fireNumber = self.currentAdminIncident.incidentNumberSequence;
        self.incident.wildfireYear = self.currentAdminIncident.wildfireYear;
        self.incident.incidentNumberSequence= self.currentAdminIncident.incidentNumberSequence;
        self.incident.fireName = publishedIncident.incidentName;
        self.incident.traditionalTerritory = publishedIncident.traditionalTerritoryDetail;
        self.incident.lastPublished = publishedIncident.publishedTimestamp,
        self.incident.publishedStatus = publishedIncident.newsPublicationStatusCode,
        self.incident.fireOfNote = publishedIncident.fireOfNoteInd;
        self.incident.location = publishedIncident.incidentLocation;
        self.incident.sizeType = publishedIncident.incidentSizeType == "null" ? 1 : Number(publishedIncident.incidentSizeType);
        self.incident.sizeHectares = publishedIncident.incidentSizeEstimatedHa;
        self.incident.sizeComments = publishedIncident.incidentSizeDetail;
        self.incident.cause = publishedIncident.generalIncidentCauseCatId;
       // this.incident.causeComments = publishedIncident.incidentLocation;
        self.incident.responseComments = self.currentAdminIncident.responseObjectiveDescription;
        self.incident.wildifreCrewsInd = publishedIncident.wildfireCrewResourcesInd;
        self.incident.crewsComments = publishedIncident.wildfireCrewResourcesDetail;
        self.incident.aviationInd = publishedIncident.wildfireAviationResourceInd;
        self.incident.aviationComments = publishedIncident.wildfireAviationResourceDetail;
        self.incident.incidentManagementInd = publishedIncident.incidentMgmtCrewRsrcInd;
        self.incident.incidentManagementComments = publishedIncident.incidentMgmtCrewRsrcDetail;
        self.incident.heavyEquipmentInd = publishedIncident.heavyEquipmentResourcesInd;
        self.incident.heavyEquipmentComments = publishedIncident.heavyEquipmentResourcesDetail;
        self.incident.structureProtectionInd = publishedIncident.structureProtectionRsrcInd;
        self.incident.structureProtectionComments = publishedIncident.structureProtectionRsrcDetail;
        //this.incident.contact.isPrimary = publishedIncident.incidentLocation;
        self.incident.contact.fireCentre = publishedIncident.contactOrgUnitIdentifer;
        self.incident.contact.phoneNumber = publishedIncident.contactPhoneNumber;
        self.incident.contact.emailAddress = publishedIncident.contactEmailAddress;
        // this.incident.geometry: {
        // this.incident.  x: -115,
        // this.incident.  y: 50
        // this.incident.},
        // this.incident.incidentOverview = publishedIncident.incidentOverview;
        // this.incident.evacOrders = publishedIncident.incidentLocation;
        // this.incident.mapAttachments = publishedIncident.incidentLocation;
        // this.incident.incidentData = publishedIncident.incidentLocation;
        
        this.incidentForm.patchValue(this.incident);
        
        this.incidentForm.patchValue(this.currentAdminIncident);
      });
      
    }

    if (changes.adminIncidentCause){
      this.currentAdminIncidentCause = changes.adminIncidentCause.currentValue
    }

    this.cdr.detectChanges();
  }

  publishChanges () {
    if (this.incidentForm.invalid) {
        // stop here if it's invalid
        alert('Invalid');
        return;
    }
    const rawData = this.incidentForm.getRawValue()
    console.log(rawData)
    
    const self = this;
    let dialogRef = this.dialog.open(PublishDialogComponent, {
      width: '350px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.publish) {
        let publishedIncidentResource = {
          publishedIncidentDetailGuid: this.currentAdminIncident["wildfireIncidentGuid"],
          incidentGuid: this.currentAdminIncident["wildfireIncidentGuid"],
          newsCreatedTimestamp: new Date().valueOf().toString(),
          discoveryDate: new Date().valueOf().toString(),
          newsPublicationStatusCode: "PUBLISHED",
          generalIncidentCauseCatId: Number(this.incidentForm.controls['cause'].value),
          fireOfNoteInd: this.incident.fireOfNote,
          incidentName: this.incident.fireName,
          incidentLocation: this.incident.location,
          incidentOverview: this.incident.incidentOverview,
          traditionalTerritoryDetail: this.incident.traditionalTerritory,
          incidentSizeType: this.incident.sizeType.toString(),
          incidentSizeEstimatedHa: this.incident.sizeHectares,
          incidentSizeDetail: this.incident.sizeComments,
          incidentCauseDetail: this.incident.causeComments,
          contactOrgUnitIdentifer: this.incident.contact.fireCentre,
          contactPhoneNumber: this.incident.contact.phoneNumber,
          contactEmailAddress: this.incident.contact.emailAddress,
          wildfireCrewResourcesInd: this.incident.wildifreCrewsInd ? "Y" : "N",
          wildfireCrewResourcesDetail: this.incident.crewsComments,
          wildfireAviationResourceInd: this.incident.aviationInd ? "Y" : "N",
          wildfireAviationResourceDetail: this.incident.aviationComments,
          heavyEquipmentResourcesInd: this.incident.heavyEquipmentInd ? "Y" : "N",
          heavyEquipmentResourcesDetail: this.incident.heavyEquipmentComments,
          incidentMgmtCrewRsrcInd: this.incident.incidentManagementInd ? "Y" : "N",
          incidentMgmtCrewRsrcDetail: this.incident.incidentManagementComments,
          structureProtectionRsrcInd: this.incident.structureProtectionInd ? "Y" : "N",
          structureProtectionRsrcDetail: this.incident.structureProtectionComments,
          type: this.publishedIncidentType
        };

        self.publishIncident(publishedIncidentResource, this.currentAdminIncident["wildfireIncidentGuid"]).then(doc => {
          this.snackbarService.open('Incident Published Successfully', 'OK', { duration: 100000, panelClass: 'snackbar-success' });
        }).catch(err => {
            this.snackbarService.open('Failed to Publish Incident: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
          }).finally(() => {
            self.loaded = false;
            this.cdr.detectChanges();
          }).catch(err => {
            this.snackbarService.open('Failed to Publish Incident: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
          })
      }
    });
  }

  publishIncident(incident: PublishedIncidentResource, incidentLabel: string): Promise<any> {
    return this.publishedIncidentService.publish(incident, incidentLabel);
  }

  onShowPreview() {
    let mappedIncident = {
      incidentGuid:  this.currentAdminIncident["wildfireIncidentGuid"],
      incidentNumberLabel:this.incident.fireName,
      stageOfControlCode:this.incident.incidentData.incidentStatusCode,
      generalIncidentCauseCatId: this.incidentForm.controls['cause'].value == "Human" ? 1 : this.incidentForm.controls['cause'].value == "Lightning" ? 2 : 3,
      discoveryDate: new Date(this.incident.incidentData.discoveryTimestamp).toString(),
      fireCentre: (this.incidentForm.controls['contact'] as FormGroup).controls['fireCentre'].value,
      fireOfNoteInd: this.incidentForm.controls['fireOfNotePublishedInd'].value,
      incidentName: this.incidentForm.controls['incidentNumberSequence'].value,
      incidentLocation: this.incidentForm.controls['geographicDescription'].value,
      incidentOverview: this.incident.incidentOverview,
      traditionalTerritoryDetail: this.incidentForm.controls['traditionalTerritory'].value,
      incidentSizeType: this.incidentForm.controls['sizeType'].value,
      incidentSizeEstimatedHa: this.incidentForm.controls['sizeHectares'].value,
      incidentSizeDetail: this.incidentForm.controls['sizeComments'].value,
      incidentCauseDetail: this.incidentForm.controls['causeComments'].value,
      contactOrgUnitIdentifer:null,
      contactPhoneNumber:  (this.incidentForm.controls['contact'] as FormGroup).controls['phoneNumber'].value,
      contactEmailAddress:  (this.incidentForm.controls['contact'] as FormGroup).controls['emailAddress'].value,
      wildfireCrewResourcesInd: this.incidentForm.controls['wildifreCrewsInd'].value,
      wildfireCrewResourcesDetail: this.incidentForm.controls['crewsComments'].value,
      wildfireAviationResourceInd: this.incidentForm.controls['aviationInd'].value,
      wildfireAviationResourceDetail: this.incidentForm.controls['aviationComments'].value,
      heavyEquipmentResourcesInd: this.incidentForm.controls['heavyEquipmentInd'].value,
      heavyEquipmentResourcesDetail: this.incidentForm.controls['heavyEquipmentComments'].value,
      incidentMgmtCrewRsrcInd: this.incidentForm.controls['incidentManagementInd'].value,
      incidentMgmtCrewRsrcDetail: this.incidentForm.controls['incidentManagementComments'].value,
      structureProtectionRsrcInd: this.incidentForm.controls['structureProtectionInd'].value,
      structureProtectionRsrcDetail: this.incidentForm.controls['structureProtectionComments'].value,
      lastUpdatedTimestamp: new Date(this.incident.incidentData.lastUpdatedTimestamp).toString(),
      latitude: this.incident.incidentData.incidentLocation.latitude,
      longitude: this.incident.incidentData.incidentLocation.longitude,
      fireYear: this.incident.wildfireYear
    }

    if (localStorage.getItem("preview_incident") != null) {
      localStorage.removeItem("preview_incident");
    }

    localStorage.setItem("preview_incident", JSON.stringify(mappedIncident));

    const url = this.componentRouter.serializeUrl(
      this.componentRouter.createUrlTree(['incidents'], { queryParams: { preview: true } })
    );

    window.open(url, '_blank');
  }

  // for decoupled editor
  public onReady( editor ) {
    editor.ui.getEditableElement().parentElement.insertBefore(
        editor.ui.view.toolbar.element,
        editor.ui.getEditableElement()
    );

    editor.plugins.get( 'FileRepository' ).createUploadAdapter = (loader) => {
      return new CustomImageUploader( loader )
    }
  }
}
