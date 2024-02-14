import { AfterViewInit, Component } from '@angular/core';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { currentFireYear } from '@app/utils';

@Component({
  selector: 'fire-totals-widget',
  templateUrl: './fire-totals-widget.component.html',
  styleUrls: ['./fire-totals-widget.component.scss'],
})
export class FireTotalsWidget implements AfterViewInit {
  public startupComplete = false;

  public totalFires = 0;
  public outFires = 0;
  public hectaresBurned = 0;
  public fireYear: number;
  
  constructor(private publishedIncidentService: PublishedIncidentService) {}

  ngAfterViewInit(): void {
    this.fireYear = currentFireYear();

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
                activeOutOfControlFires,
                activeUnderControlFires,
              },
            ) =>
              n +
              activeBeingHeldFires +
              activeOutOfControlFires +
              activeUnderControlFires,
            0,
          ) || 0;
        const previousYearActive =
          previousYearStats.reduce(
            (
              n,
              {
                activeBeingHeldFires,
                activeOutOfControlFires,
                activeUnderControlFires,
              },
            ) =>
              n +
              activeBeingHeldFires +
              activeOutOfControlFires +
              activeUnderControlFires,
            0,
          ) || 0;
        const currentYearOut =
          stats.reduce((n, { outFires }) => n + outFires, 0) || 0;

        this.totalFires =
          currentYearActive + previousYearActive + currentYearOut;
        this.outFires = currentYearOut;
        this.hectaresBurned =
          Math.round(
            stats.reduce((n, { hectaresBurned }) => n + hectaresBurned, 0) || 0,
          ) || 0;

        this.startupComplete = true;
      })
      .catch((err) => {
        console.error(err);
      });
  }

}
