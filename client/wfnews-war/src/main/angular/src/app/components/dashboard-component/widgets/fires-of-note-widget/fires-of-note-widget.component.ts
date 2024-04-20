import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AGOLService } from '@app/services/AGOL-service';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import {
  convertFireNumber,
  convertToStageOfControlDescription,
  snowPlowHelper,
} from '@app/utils';
import { AppConfigService } from '@wf1/core-ui';

@Component({
  selector: 'fires-of-note-widget',
  templateUrl: './fires-of-note-widget.component.html',
  styleUrls: ['./fires-of-note-widget.component.scss'],
})
export class FiresOfNoteWidget implements AfterViewInit {
  public startupComplete = false;
  public activeFireOfNote = 0;
  public activeFiresList = [];
  public updateCount = 0;
  public snowPlowHelper = snowPlowHelper

  convertToStageOfControlDescription = convertToStageOfControlDescription;

  constructor(
    private publishedIncidentService: PublishedIncidentService,
    private agolService: AGOLService,
    protected cdr: ChangeDetectorRef,
    protected router: Router,
    protected appConfigService: AppConfigService
  ) {}

  ngAfterViewInit(): void {
    this.publishedIncidentService
      .fetchPublishedIncidents(0, 9999, true, false)
      .toPromise()
      .then((activeFoNIncidents) => {
        if (
          activeFoNIncidents &&
          activeFoNIncidents.collection &&
          activeFoNIncidents.collection.length > 0
        ) {
          this.activeFireOfNote = activeFoNIncidents.collection.length;

          activeFoNIncidents.collection.sort((a, b) =>
            a.discoveryDate > b.discoveryDate
              ? -1
              : b.discoveryDate > a.discoveryDate
                ? 1
                : 0,
          );
          this.activeFiresList = activeFoNIncidents.collection;
          // only keep the first 4
          if (this.activeFiresList.length > 4) {
            this.activeFiresList = this.activeFiresList.slice(0, 4);
          }
        }

        // Determine if the FoN has any evacuation notices related to it. All we need is the counts
        for (const incident of this.activeFiresList) {
          incident.ordersCount = 0;
          incident.alertsCount = 0;
          // don't make the fetch async, and don't await the result. We want the page to render
          // quickly in case the agol service is struggling to return a result.
          this.agolService
            .getEvacOrdersByEventNumber(convertFireNumber(incident))
            .toPromise()
            .then((results) => {
              if (results && results.features && results.features.length > 0) {
                incident.ordersCount = results.features.filter(
                  (e) => e.attributes.ORDER_ALERT_STATUS === 'Order',
                ).length;
                incident.alertsCount = results.features.filter(
                  (e) => e.attributes.ORDER_ALERT_STATUS === 'Alert',
                ).length;
                // may need a change detection here to re-render the FoN tiles
                // The updateCount is just an arbitrary attribute to force change detection rerendering
                this.updateCount += 1;
                this.cdr.detectChanges();
              }
            });
        }

        this.startupComplete = true;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  convertToDateString(date) {
    return new Date(date).toLocaleDateString();
  }

  async viewIncident(incident) {
      const queryParams = {
        fireYear: incident.fireYear,
        incidentNumber: incident.incidentNumberLabel,
      };
      this.router.navigate(['/incidents'], { queryParams });
      this.snowplowCaller('navigate to ' + incident.incidentNumberLabel)
  }

  snowplowCaller(text) {
    const url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1);
    this.snowPlowHelper(url, {
      action: 'dashboard_click',
      text: text,
    });
  }
}
