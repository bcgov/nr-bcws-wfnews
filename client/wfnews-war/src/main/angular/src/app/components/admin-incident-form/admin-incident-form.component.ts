import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'admin-incident-form',
  templateUrl: './admin-incident-form.component.html',
  styleUrls: ['./admin-incident-form.component.scss']
})
export class AdminIncidentForm implements OnInit, OnChanges {
  // This is a stub used for testing purposes only
  // when an actual resource model is in place, use that
  // and load from the store/api
  public incident = {
    fireNumber: 'V245512',
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
    causeComments: ''
  }

  public readonly incidentForm: FormGroup

  constructor(private http: HttpClient,
              private appConfig: AppConfigService,
              private readonly formBuilder: FormBuilder) {
    this.incidentForm = this.formBuilder.group({
      fireName: [],
      fireNumber: [],
      traditionalTerritory: [],
      lastPublished: [],
      publishedStatus: [],
      fireOfNote: [],
      location: [],
      sizeType: [],
      sizeHectares: [],
      sizeComments: [],
      cause: [],
      causeComments: [],
      // Alternatively, move each section into a subgroup
      //incidentInformation: this.formBuilder.group({
      //  fireName: [],
      //})
      //myRequiredField: ['', Validators.required],
    })
    // Update this to to pull from the api... service.getData().subscribe(...)
    this.incidentForm.patchValue(this.incident)
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
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
}
