import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { PublishedIncidentService } from '../../services/published-incident-service';

@Component({
  selector: 'wf-stats',
  templateUrl: './wf-stats.component.html',
  styleUrls: [ './wf-stats.component.scss' ]
})
export class WFStatsComponent implements OnInit {
  public fires = []
  public outFires = []
  public firesLast24 = 'Unknown'
  public firesLast7Days = 'Unknown'
  public thisYearCount = 'Unknown'
  public loading = true
  public tabIndex = 0
  // chart data
  public activeFiresByCentre = []
  public fireStats = []
  public activeFiresByCause = []
  public activeFiresByStatus = []
  public allFiresByCentre = []
  public allFiresByCause = []
  public allFiresByStatus = []

  private updateSubscription: Subscription;

  public FIRE_CENTRE_COLOURS = [
    { name: 'Coastal', value: '#519a97' },
    { name: 'Northwest', value: '#a27ea8' },
    { name: 'Prince George', value: '#799136' },
    { name: 'Kamloops', value: '#e96b56' },
    { name: 'Southeast', value: '#369dc9' },
    { name: 'Cariboo', value: '#ca8321' }
  ]

  public CAUSE_COLOURS = [
    { name: 'Lightning', value: '#519a97' },
    { name: 'Person', value: '#a27ea8' },
    { name: 'Unknown', value: '#799136' }
  ]

  public STAGE_OF_CONTROL_COLOURS = [
    { name: 'Fire of Note', value: '#519a97' },
    { name: 'Out of Control', value: '#a27ea8' },
    { name: 'Being Held', value: '#799136' },
    { name: 'Under Control', value: '#e96b56' },
    { name: 'Out', value: '#369dc9' }
  ]

  constructor(protected snackbarService: MatSnackBar,
              private publishedIncidentService: PublishedIncidentService,
              protected cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.loadData().then(() => {
      this.loading = false;
      // 600000 is 10 minutes in milliseconds
      this.updateSubscription = interval(600000).subscribe(() => {
        this.loadData()
      });
    }).catch(err => {
      this.snackbarService.open('Failed to load fire data: ' + JSON.stringify(err.message), 'OK', { duration: 10000, panelClass: 'snackbar-error' });
    })
  }

  private async loadData (): Promise<any> {
    this.activeFiresByCentre = [];
    this.fireStats = [];
    this.activeFiresByCause = [];
    this.activeFiresByStatus = [];
    this.fires = [];
    this.outFires = [];

    const activeIncidents = await this.publishedIncidentService.fetchPublishedIncidents().toPromise()
    const outIncidents = await this.publishedIncidentService.fetchPublishedIncidents(0, 9999, false, true).toPromise()

    this.outFires = outIncidents.collection
    this.fires = activeIncidents.collection

    this.firesLast24 = activeIncidents.collection.filter(f => f.discoveryDate > Date.now() - 86400000).length + outIncidents.collection.filter(f => f.discoveryDate > Date.now() - 86400000).length
    this.firesLast7Days = activeIncidents.collection.filter(f => f.discoveryDate > Date.now() - 604800000).length + outIncidents.collection.filter(f => f.discoveryDate > Date.now() - 604800000).length
    this.thisYearCount = activeIncidents.collection.length + outIncidents.collection.length

    if (this.fires) {
      const fcData = []
      const fcAllData = []
      const fcStats = []
      for (const centre of FIRE_CENTRES) {
        const fireCount = this.fires.filter(f => f.fireCentre === centre.id).length
        const outFireCount = this.outFires.filter(f => f.fireCentre === centre.id).length
        fcData.push({
          name: centre.name,
          value: fireCount
        })
        fcAllData.push({
          name: centre.name,
          value: fireCount + outFireCount
        })
        fcStats.push({
          name: centre.name,
          lightningStarts: activeIncidents.collection.filter(f => f.fireCentre === centre.id && f.discoveryDate > Date.now() - 86400000 && f.generalIncidentCauseCatId === 2).length + outIncidents.collection.filter(f => f.fireCentre === centre.id && f.discoveryDate > Date.now() - 86400000 && f.generalIncidentCauseCatId === 2).length,
          humanStarts: activeIncidents.collection.filter(f => f.fireCentre === centre.id && f.discoveryDate > Date.now() - 86400000 && f.generalIncidentCauseCatId === 1).length + outIncidents.collection.filter(f => f.fireCentre === centre.id && f.discoveryDate > Date.now() - 86400000 && f.generalIncidentCauseCatId === 1).length,
          totalFires: fireCount + outFireCount,
          areaBurned: activeIncidents.collection.map(f => f.fireCentre === centre.id && f.incidentSizeEstimatedHa).reduce((p, n) => p + n)
        })
      }

      const causeData = []
      const causeAllData = []
      for (const cause of FIRE_CAUSE) {
        const fireCount = this.fires.filter(f => f.generalIncidentCauseCatId === cause.id).length
        const outFireCount = this.outFires.filter(f => f.generalIncidentCauseCatId === cause.id).length
        causeData.push({
          name: cause.name,
          value: fireCount
        })
        causeAllData.push({
          name: cause.name,
          value: fireCount + outFireCount
        })
      }

      const statusData = []
      const statusAllData = []
      for (const status of FIRE_STATUS) {
        const fireCount = this.fires.filter(f => f.stageOfControlCode === status.id || (f.fireOfNoteInd && status.id ==='NOTE' )).length
        statusData.push({
          name: status.name,
          value: fireCount
        })
        statusAllData.push({
          name: status.name,
          value: fireCount
        })
      }
      statusAllData.push({
        name: 'Out',
        value: this.outFires.length
      })

      // work around to get change detection on the data
      this.activeFiresByCentre = [...fcData]
      this.activeFiresByCause = [...causeData]
      this.activeFiresByStatus = [...statusData]
      this.fireStats = [...fcStats]

      this.allFiresByCentre = [...fcAllData]
      this.allFiresByCause = [...causeAllData]
      this.allFiresByStatus = [...statusAllData]
    }

    this.cdr.detectChanges()
  }

  ngDoCheck() {
    this.loading = false
  }

  getFireYear (offset: number = 0) {
    if (new Date().getMonth() <= 2) {
      return new Date().getFullYear() - 1 + offset
    } else {
      return new Date().getFullYear() + offset
    }
  }

  getFiresByCentreTotals (): number {
    return this.activeFiresByCentre.map(r => r.value).reduce((p, n) => p + n)
  }
}

const FIRE_CENTRES = [
  { id: '50', name: 'Coastal', displayOrder: 1 },
  { id: '42', name: 'Northwest', displayOrder: 2 },
  { id: '34', name: 'Prince George', displayOrder: 3 },
  { id: '25', name: 'Kamloops', displayOrder: 4 },
  { id: '8', name: 'Southeast', displayOrder: 5 },
  { id: '2', name: 'Cariboo', displayOrder: 6 }
];

const FIRE_CAUSE = [
  { id: 2, name: 'Lightning', displayOrder: 1 },
  { id: 1, name: 'People', displayOrder: 2 },
  { id: 3, name: 'Unknown', displayOrder: 3 }
];

const FIRE_STATUS = [
  { id: 'NOTE', name: 'Fire of Note', displayOrder: 1 },
  { id: 'OUT_CNTRL', name: 'Out of Control', displayOrder: 2 },
  { id: 'HOLDING', name: 'Being Held', displayOrder: 3 },
  { id: 'UNDR_CNTRL', name: 'Under Control', displayOrder: 4 },
  { id: 'OUT', name: 'Out', displayOrder: 5 }
]
