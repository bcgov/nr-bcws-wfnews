import { AfterViewInit, Component, Input } from '@angular/core';
import { PublishedIncidentService } from '@app/services/published-incident-service';
import { FireCentres, currentFireYear } from '@app/utils';

@Component({
  selector: 'fire-cause-widget',
  templateUrl: './fire-cause-widget.component.html',
  styleUrls: ['./fire-cause-widget.component.scss'],
})
export class FireCauseWidget implements AfterViewInit {
  @Input() public yearly = false;

  public startupComplete = false;
  public selectedFireCentreCode = '';
  public fireCentreOptions = FireCentres;
  public lightningFires: number;
  public humanFires: number;
  public unknownFires: number;
  public lightningFiresPct: number;
  public humanFiresPct: number;
  public unknownFiresPct: number;

  constructor(private publishedIncidentService: PublishedIncidentService) {}

  ngAfterViewInit(): void {
    this.queryData();
  }

  queryData() {
    this.startupComplete = false;
    const fireCentre =
      this.selectedFireCentreCode && this.selectedFireCentreCode !== ''
        ? FireCentres.find((fc) => fc.code === this.selectedFireCentreCode)
            .description
        : 'BC';

    Promise.all([
      this.publishedIncidentService
        .fetchStatistics(currentFireYear() - 1, fireCentre)
        .toPromise(),
      this.publishedIncidentService
        .fetchStatistics(currentFireYear(), fireCentre)
        .toPromise(),
    ])
      .then(([previousYearStats, stats]) => {
        // counts by cause code
        const currentYearHuman =
          stats.reduce(
            (n, { activeHumanCausedFires }) => n + activeHumanCausedFires,
            0,
          ) || 0;
        const humanOut =
          stats.reduce(
            (n, { extinguishedHumanCausedFires }) =>
              n + extinguishedHumanCausedFires,
            0,
          ) || 0;

        const previousYearHuman =
          previousYearStats.reduce(
            (n, { activeHumanCausedFires }) => n + activeHumanCausedFires,
            0,
          ) || 0;

        const currentYearNatural =
          stats.reduce(
            (n, { activeNaturalCausedFires }) => n + activeNaturalCausedFires,
            0,
          ) || 0;
        const naturalOut =
          stats.reduce(
            (n, { extinguishedNaturalCausedFires }) =>
              n + extinguishedNaturalCausedFires,
            0,
          ) || 0;

        const previousYearNatural =
          previousYearStats.reduce(
            (n, { activeNaturalCausedFires }) => n + activeNaturalCausedFires,
            0,
          ) || 0;

        const currentYearUnknown =
          stats.reduce(
            (n, { activeUnknownCausedFires }) => n + activeUnknownCausedFires,
            0,
          ) || 0;
        const unknownOut =
          stats.reduce(
            (n, { extinguishedUnknownCausedFires }) =>
              n + extinguishedUnknownCausedFires,
            0,
          ) || 0;

        const previousYearUnknown =
          previousYearStats.reduce(
            (n, { activeUnknownCausedFires }) => n + activeUnknownCausedFires,
            0,
          ) || 0;

        const totalCurrentYear =
          currentYearHuman + currentYearNatural + currentYearUnknown;
        const totalPreviousYear =
          previousYearHuman + previousYearNatural + previousYearUnknown;

        const currentYearOut = humanOut + naturalOut + unknownOut;

        const totalFires =
          totalCurrentYear +
          Number(this.yearly ? 0 : totalPreviousYear) +
          Number(this.yearly ? currentYearOut : 0);

        // If this is a yearly totals sum, then we need to include outfires
        this.lightningFires =
          currentYearNatural +
          Number(this.yearly ? 0 : previousYearNatural) +
          (this.yearly ? naturalOut : 0);
        this.lightningFiresPct =
          Math.round((this.lightningFires / totalFires) * 100) || 0;
        
        this.humanFires =
          currentYearHuman + 
          Number(this.yearly ? 0 : previousYearHuman) +
          (this.yearly ? humanOut : 0);
        this.humanFiresPct =
          Math.round((this.humanFires / totalFires) * 100) || 0;
        
        this.unknownFires =
          currentYearUnknown +
          Number(this.yearly ? 0 : previousYearUnknown) +
          (this.yearly ? unknownOut : 0);
        this.unknownFiresPct =
          Math.round((this.unknownFires / totalFires) * 100) || 0;

        this.startupComplete = true;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  selectFireCentre(value) {
    this.queryData();
  }
}
