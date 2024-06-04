import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AGOLService, AgolOptions } from '@app/services/AGOL-service';

@Component({
  selector: 'wfnews-public-event-page',
  templateUrl: './public-event-page.component.html',
  styleUrls: ['./public-event-page.component.scss']
})
export class PublicEventPageComponent implements OnInit {
  public isLoading = true;
  public loadingFailed = false;
  public eventNumber: string;
  public eventName: string;
  public evac: string;
  public areaRestriction: string
  public ban: string
  public dangerRating: string

  constructor(
    private agolService: AGOLService,
    private router: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.router.queryParams.subscribe((params: ParamMap) => {
      if (params && params['eventNumber'] && 
          (params['eventType'] === 'Order' || params['eventType'] === 'Alert')) {
        this.eventNumber = params['eventNumber'];
        this.populateEvacByID({
          returnGeometry: true,
          returnCentroid: true,
          returnExtent: false,
        });
      }
      else if(params && params['eventName'] && params['eventType'] === 'area-restriction'){
        this.eventName = params['eventName'];
        this.populateAreaRestrictionByName();
      }
      else if(params && params['eventNumber'] && params['eventType'] === 'ban'){
        this.eventNumber = params['eventNumber'];
        this.populateBanById();
      }
      else if(params && params['eventNumber'] && params['eventType'] === 'danger-rating'){
        this.eventNumber = params['eventNumber'];
        this.populateDangerRatingById();
      }
    });
  }


  async populateEvacByID(options: AgolOptions = null) {
    this.agolService
      .getEvacOrdersByEventNumber(
        this.eventNumber,
        options
      )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          this.evac = response.features[0];
          this.isLoading = false;
        }
      });
  }

  async populateAreaRestrictionByName(options: AgolOptions = null) {
    this.agolService
    .getAreaRestrictions(
      `NAME='${this.eventName}'`,
      null,
      {
        returnGeometry: true,
        returnCentroid: true,
        returnExtent: false,
      },
    )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          this.areaRestriction = response.features[0];
          this.isLoading = false;
        }
      });
  }

  async populateBanById(options: AgolOptions = null) {
    this.agolService
    .getBansAndProhibitionsById(
      this.eventNumber, {
        returnGeometry: true,
        returnCentroid: true,
        returnExtent: false,
      })
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          this.ban = response.features[0];
          this.isLoading = false;
        }
      });
  }

  async populateDangerRatingById(options: AgolOptions = null) {
    this.agolService
    this.agolService
    .getDangerRatings(
      `PROT_DR_SYSID ='${this.eventNumber}'`,
      null,
      {
        returnGeometry: true,
        returnCentroid: true,
      },
    )
      .toPromise()
      .then((response) => {
        if (response?.features?.length > 0 && response?.features[0].geometry?.rings?.length > 0) {
          this.dangerRating = response.features[0];
          this.isLoading = false;
        }
      });
  }

}