import { ChangeDetectorRef,  Directive, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { IncidentCauseResource, WildfireIncidentResource, PublishedIncidentResource } from '@wf1/incidents-rest-api';
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';
import { CustomImageUploader } from './incident-details-panel/custom-uploader';
import { RootState } from '../../store';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PublishDialogComponent } from './publish-dialog/publish-dialog.component';
import { PublishedIncidentService } from '../../services/published-incident-service';
import { IncidentDetailsPanel } from './incident-details-panel/incident-details-panel.component';
import { getIncident } from '../../store/incident/incident.action';

@Directive()
export class AdminIncidentForm implements OnInit, OnChanges {
  // This is a stub used for testing purposes only
  // when an actual resource model is in place, use that
  // and load from the store/api
  @Input() adminIncident: any;
  @Input() adminIncidentCause: any;
  @ViewChild("detailsPanelComponent") detailsPanelComponent: IncidentDetailsPanel;

  public Editor = Editor;

  // TODO: Remove the default values here.
  
  public incident = {
    fireNumber: 0,
    wildfireYear: 2022,
    incidentNumberSequence: 0,
    fireName: "",
    traditionalTerritory: "",
    lastPublished: undefined,
    publishedStatus: 'DRAFT',
    fireOfNote: false,
    location: "",
    sizeType: 1,
    sizeHectares: 0,
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
  publishedIncidentDetailGuid: string;

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
          this.store.dispatch(getIncident(this.wildFireYear, this.incidentNumberSequnce))
        }
      }
    )
  }

  ngOnChanges(changes: SimpleChanges) {
    // TODO: This can be removed once the onInit is updated to map the form correctly
    if (changes.adminIncident && changes.adminIncident.currentValue){
      this.currentAdminIncident = changes.adminIncident.currentValue
      var self = this;
      
      this.publishedIncidentService.fetchIMIncident(this.currentAdminIncident.wildfireYear.toString(), this.currentAdminIncident.incidentNumberSequence.toString())
          .subscribe(incidentResponse => {
                let publishedIncident = incidentResponse.response;
                this.publishedIncidentType = publishedIncident.type;
                self.incident.fireNumber = self.currentAdminIncident.incidentNumberSequence;
                self.incident.wildfireYear = self.currentAdminIncident.wildfireYear;
                self.incident.incidentNumberSequence= self.currentAdminIncident.incidentNumberSequence;
                self.incident.fireName = publishedIncident.incidentName;
                self.incident.publishedStatus = "DRAFT",
                self.incident.location = publishedIncident.incidentLocation.geographicDescription;
                
                this.publishedIncidentDetailGuid = this.currentAdminIncident["wildfireIncidentGuid"];
                this.incidentForm.patchValue(this.incident);
                this.incidentForm.patchValue(this.currentAdminIncident);

                this.cdr.detectChanges();

                incidentResponse.getPublishedIncident.subscribe( 
                  (response)=> {
                    self.publishedIncidentDetailGuid = response.publishedIncidentDetailGuid;
                    self.incident.traditionalTerritory = response.traditionalTerritoryDetail;
                    self.incident.lastPublished = publishedIncident.publishedTimestamp,
                    self.incident.location = response.incidentLocation;
                    self.incident.sizeType = response.incidentSizeType == "null" ? 1 : Number(response.incidentSizeType);
                    if(self.incident.sizeType == 1)
                      self.incident.sizeHectares = response.incidentSizeEstimatedHa;
                    else if (self.incident.sizeType == 2)
                    self.incident.sizeHectares = response.incidentSizeMappedHa;

                    self.incident.sizeComments = response.incidentSizeDetail;
                    
                    self.incident.cause = response.generalIncidentCauseCatId;
                    
                    if(self.incident.cause)
                      self.detailsPanelComponent.setCauseDisclaimer(self.incident.cause);

                    self.incident.fireOfNote = response.fireOfNoteInd;
                    self.incident.publishedStatus = response.newsPublicationStatusCode;
                    self.incident.responseComments = self.currentAdminIncident.responseObjectiveDescription;
                    
                    self.incident.wildifreCrewsInd = response.wildfireCrewResourcesInd;
                    self.incident.crewsComments = response.wildfireCrewResourcesDetail;

                    self.incident.aviationInd = response.wildfireAviationResourceInd;
                    self.incident.aviationComments = response.wildfireAviationResourceDetail;

                    self.incident.incidentManagementInd = response.incidentMgmtCrewRsrcInd;
                    self.incident.incidentManagementComments = response.incidentMgmtCrewRsrcDetail;
                    self.incident.heavyEquipmentInd = response.heavyEquipmentResourcesInd;
                    self.incident.heavyEquipmentComments = response.heavyEquipmentResourcesDetail;
                    self.incident.structureProtectionInd = response.structureProtectionRsrcInd;
                    self.incident.structureProtectionComments = response.structureProtectionRsrcDetail;
                    this.incident.contact.isPrimary = true;
                    self.incident.contact.fireCentre = response.contactOrgUnitIdentifer;
                    self.incident.contact.phoneNumber = response.contactPhoneNumber;
                    self.incident.contact.emailAddress = response.contactEmailAddress;
                    this.incident.incidentOverview = response.incidentOverview;
                   
                    this.cdr.detectChanges();
                  },
                  (error)=> {
                    self.publishedIncidentDetailGuid = null;
                  }
                )
              }, 
              (incidentResponseError)=>{
                this.snackbarService.open('Failed to fetch Incident: ' + JSON.stringify(incidentResponseError), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
              });
    }

    if (changes.adminIncidentCause){
      this.currentAdminIncidentCause = changes.adminIncidentCause.currentValue
    }

    this.cdr.detectChanges();
  }

  publishChanges () {
    const self = this;
    let dialogRef = this.dialog.open(PublishDialogComponent, {
      width: '350px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.publish) {
        let publishedIncidentResource = {
          publishedIncidentDetailGuid:  this.publishedIncidentDetailGuid,
          incidentGuid:  this.currentAdminIncident["wildfireIncidentGuid"],
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
          wildfireCrewResourcesInd: this.incident.wildifreCrewsInd,
          wildfireCrewResourcesDetail: this.incident.crewsComments,
          wildfireAviationResourceInd: this.incident.aviationInd,
          wildfireAviationResourceDetail: this.incident.aviationComments,
          heavyEquipmentResourcesInd: this.incident.heavyEquipmentInd,
          heavyEquipmentResourcesDetail: this.incident.heavyEquipmentComments,
          incidentMgmtCrewRsrcInd: this.incident.incidentManagementInd,
          incidentMgmtCrewRsrcDetail: this.incident.incidentManagementComments,
          structureProtectionRsrcInd: this.incident.structureProtectionInd,
          structureProtectionRsrcDetail: this.incident.structureProtectionComments,
          type: this.publishedIncidentType,
          "@type" : "http://wfim.nrs.gov.bc.ca/v1/publishedIncident"
        };
        
        self.publishIncident(publishedIncidentResource).then(doc => {
          this.snackbarService.open('Incident Published Successfully', 'OK', { duration: 100000, panelClass: 'snackbar-success-v2' });
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

  publishIncident(incident): Promise<any> {
    return this.publishedIncidentService.saveIMPublishedIncident(incident).toPromise();
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
