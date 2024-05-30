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
  public evac: string;

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
}