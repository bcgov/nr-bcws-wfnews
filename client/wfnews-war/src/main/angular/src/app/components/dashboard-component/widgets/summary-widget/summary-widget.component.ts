import { AfterViewInit, Component } from '@angular/core';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { currentFireYear } from '@app/utils';

@Component({
  selector: 'summary-widget',
  templateUrl: './summary-widget.component.html',
  styleUrls: ['./summary-widget.component.scss'],
})
export class SummaryWidget implements AfterViewInit {
  public startupComplete = false;

  public activeFires: string;
  public starts24hour: string;
  public out24Hours: string;
  public out7Day: string;

  constructor(private publishedIncidentService: PublishedIncidentService) {}

  ngAfterViewInit(): void {
    Promise.all([
      this.publishedIncidentService
        .fetchStatistics(currentFireYear() - 1)
        .toPromise(),
      this.publishedIncidentService
        .fetchStatistics(currentFireYear())
        .toPromise(),
    ])
      .then(([previousYearStats, stats]) => {
        const currentYearActive =
          stats.reduce(
            (
              n,
              {
                activeBeingHeldFires,
                activeBeingHeldFiresOfNote,
                activeOutOfControlFires,
                activeOutOfControlFiresOfNote,
                activeUnderControlFires,
                activeUnderControlFiresOfNote,
              },
            ) =>
              n +
              activeBeingHeldFires +
              activeBeingHeldFiresOfNote +
              activeOutOfControlFires +
              activeOutOfControlFiresOfNote +
              activeUnderControlFires +
              activeUnderControlFiresOfNote,
            0,
          ) || 0;
        const previousYearActive =
          previousYearStats.reduce(
            (
              n,
              {
                activeBeingHeldFires,
                activeBeingHeldFiresOfNote,
                activeOutOfControlFires,
                activeOutOfControlFiresOfNote,
                activeUnderControlFires,
                activeUnderControlFiresOfNote,
              },
            ) =>
              n +
              activeBeingHeldFires +
              activeBeingHeldFiresOfNote +
              activeOutOfControlFires +
              activeOutOfControlFiresOfNote +
              activeUnderControlFires +
              activeUnderControlFiresOfNote,
            0,
          ) || 0;

        this.activeFires = '' + (currentYearActive + previousYearActive);
        this.starts24hour =
          '' +
          (stats.reduce((n, { newFires24Hours }) => n + newFires24Hours, 0) ||
            0);
        this.out24Hours =
          '' +
          (stats.reduce((n, { outFires24Hours }) => n + outFires24Hours, 0) ||
            0);
        this.out7Day =
          '' +
          (stats.reduce((n, { outFires7Days }) => n + outFires7Days, 0) || 0);

        this.startupComplete = true;
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
