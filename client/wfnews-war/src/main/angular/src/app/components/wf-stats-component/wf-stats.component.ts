import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { AGOLService } from '../../services/AGOL-service';

@Component({
  selector: 'wf-stats',
  templateUrl: './wf-stats.component.html',
  styleUrls: [ './wf-stats.component.scss' ]
})
export class WFStatsComponent implements OnInit {
  public fires = [];
  public outFires = [];
  public firesLast7Days = 'Unknown';
  public thisYearCount = 'Unknown';
  public loading = true;
  public tabIndex = 0;
  // chart data
  public activeFiresByCentre = [];
  public activeFiresByCause = [];
  public activeFiresByStatus = [];
  public allFiresByCentre = [];
  public allFiresByCause = [];
  public allFiresByStatus = [];

  private updateSubscription: Subscription;

  constructor(private agolService: AGOLService,
              protected snackbarService: MatSnackBar,
              protected cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.loadData().then(() => {
      this.loading = false;
      // 600000 is 10 minutes in milliseconds
      this.updateSubscription = interval(600000).subscribe(() => {
        this.loadData();
      });
    }).catch(err => {
      this.snackbarService.open('Failed to load fire data: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
    });
  }

  private async loadData(): Promise<any> {
    this.activeFiresByCentre = [];
    this.activeFiresByCause = [];
    this.activeFiresByStatus = [];
    this.fires = [];
    this.outFires = [];

    const lastXdayResult = await this.agolService.getCurrentYearFireLastXDaysStats(7).toPromise();
    if (lastXdayResult.features) {
      this.firesLast7Days = lastXdayResult.features[0].attributes.value;
    }

    const yearlyCountResult = await this.agolService.getCurrentYearFireStats().toPromise();
    if (yearlyCountResult.features) {
      this.thisYearCount = yearlyCountResult.features[0].attributes.value;
    }

    const outResults = await this.agolService.getOutFiresNoGeom().toPromise();
    if (outResults.features) {
      for (const fire of outResults.features) {
        this.outFires.push(fire);
      }
    }

    const results = await this.agolService.getActiveFiresNoGeom().toPromise();
    if (results.features) {
      for (const fire of results.features) {
        this.fires.push(fire);
      }

      const fcData = [];
      const fcAllData = [];
      for (const centre of FIRE_CENTRES) {
        const fireCount = this.fires.filter(f => f.attributes.FIRE_CENTRE === centre.id).length;
        const outFireCount = this.outFires.filter(f => f.attributes.FIRE_CENTRE === centre.id).length;
        fcData.push({
          name: centre.name,
          value: fireCount
        });
        fcAllData.push({
          name: centre.name,
          value: fireCount + outFireCount
        });
      }

      const causeData = [];
      const causeAllData = [];
      for (const cause of FIRE_CAUSE) {
        const fireCount = this.fires.filter(f => f.attributes.FIRE_CAUSE === cause.id).length;
        const outFireCount = this.outFires.filter(f => f.attributes.FIRE_CAUSE === cause.id).length;
        causeData.push({
          name: cause.name,
          value: fireCount
        });
        causeAllData.push({
          name: cause.name,
          value: fireCount + outFireCount
        });
      }

      const statusData = [];
      const statusAllData = [];
      for (const status of FIRE_STATUS) {
        const fireCount = this.fires.filter(f => f.attributes.FIRE_STATUS === status.id).length;
        statusData.push({
          name: status.name,
          value: fireCount
        });
        statusAllData.push({
          name: status.name,
          value: fireCount
        });
      }
      statusAllData.push({
        name: 'Out',
        value: this.outFires.length
      });

      // work around to get change detection on the data
      this.activeFiresByCentre = [...fcData];
      this.activeFiresByCause = [...causeData];
      this.activeFiresByStatus = [...statusData];

      this.allFiresByCentre = [...fcAllData];
      this.allFiresByCause = [...causeAllData];
      this.allFiresByStatus = [...statusAllData];
    }

    this.cdr.detectChanges();
  }

  ngDoCheck() {
    this.loading = false;
  }
}

const FIRE_CENTRES = [
  { id: 2, name: 'Coastal', displayOrder: 1 },
  { id: 3, name: 'Northwest', displayOrder: 2 },
  { id: 4, name: 'Prince George', displayOrder: 3 },
  { id: 5, name: 'Kamloops', displayOrder: 4 },
  { id: 6, name: 'Southeast', displayOrder: 5 },
  { id: 7, name: 'Cariboo', displayOrder: 6 }
];

const FIRE_CAUSE = [
  { id: 'Lightning', name: 'Lightning', displayOrder: 1 },
  { id: 'Person', name: 'Person', displayOrder: 2 },
  { id: 'Unknown', name: 'Unknown', displayOrder: 3 }
];

const FIRE_STATUS = [
  { id: 'New', name: 'New', displayOrder: 1 },
  { id: 'Out of Control', name: 'Out of Control', displayOrder: 2 },
  { id: 'Being Held', name: 'Being Held', displayOrder: 3 },
  { id: 'Under Control', name: 'Under Control', displayOrder: 4 },
  { id: 'Fire of Note', name: 'Fire of Note', displayOrder: 4 }
];
