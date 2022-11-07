import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppConfigService } from '@wf1/core-ui';
import { IncidentCauseResource, WildfireIncidentResource } from '@wf1/incidents-rest-api';
import { RootState } from '../../store';
import { getIncident } from '../../store/incident/incident.action';
import * as Editor from '@ckeditor/ckeditor5-build-decoupled-document';
@Directive()
export class AdminIncidentForm implements OnInit, OnChanges {
  // This is a stub used for testing purposes only
  // when an actual resource model is in place, use that
  // and load from the store/api
  @Input() adminIncident: any;
  @Input() adminIncidentCause: any;

  public Editor = Editor;

  public incident = {
    fireNumber: 'V245512',
    wildfireYear: '2022',
    incidentNumberSequence: 0,
    fireName: 'This is a Test',
    traditionalTerritory: 'Tsawassen',
    lastPublished: new Date(),
    publishedStatus: 'Published',
    fireOfNote: 'Y',
    location: 'Some place, some time, who knows',
    sizeType: 'Estimated',
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


  public readonly incidentForm: FormGroup

  constructor(private http: HttpClient,
              private appConfig: AppConfigService,
              private readonly formBuilder: FormBuilder,
              private router: ActivatedRoute,
              private componentRouter: Router,
              private store: Store<RootState>,
              protected cdr: ChangeDetectorRef) {
    this.incidentForm = this.formBuilder.group({
      incidentName: [],
      incidentNumberSequence: [],
      incidentLocation:[],
      traditionalTerritory: [],
      lastPublished: [],
      publishedStatus: [],
      fireOfNotePublishedInd: [],
      geographicDescription: [],
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
    if (changes.adminIncident && changes.adminIncident.currentValue){
      this.currentAdminIncident = changes.adminIncident.currentValue
      // We need to load the Published Incident from IM as well at this point!
      this.incidentForm.patchValue(this.currentAdminIncident)

      // update the stub, until we wire this properly
      this.incident.wildfireYear = this.wildFireYear
      this.incident.incidentNumberSequence = this.currentAdminIncident.incidentNumberSequence
      this.incident.fireName = this.currentAdminIncident.incidentName
      this.incident.incidentData = this.currentAdminIncident
    }

    if (changes.adminIncidentCause){
      this.currentAdminIncidentCause = changes.adminIncidentCause.currentValue
    }

    this.cdr.detectChanges();
  }

  publish () {
    if (this.incidentForm.invalid) {
        // stop here if it's invalid
        alert('Invalid');
        return;
    }
    const rawData = this.incidentForm.getRawValue()
    console.log(rawData)
    //this.service.submitUpdate(this.incidentForm.getRawValue()).subscribe((): void => {...})
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
  }
}
