import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AppConfigService } from '@wf1/core-ui';
import { interval, Subscription } from 'rxjs';
import { PublishedIncidentService } from '../../services/published-incident-service';
import { snowPlowHelper } from '../../utils';

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
  public url;
  public snowPlowHelper = snowPlowHelper


  private updateSubscription: Subscription;

  public FIRE_CENTRE_COLOURS = [
    { name: 'Coastal', value: '#519a97' },
    { name: 'Cariboo', value: '#ca8321' },
    { name: 'Kamloops', value: '#e96b56' },
    { name: 'Northwest', value: '#a27ea8' },
    { name: 'Prince George', value: '#799136' },
    { name: 'Southeast', value: '#369dc9' }
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

  constructor(protected appConfigService: AppConfigService,
              protected router: Router,
              protected snackbarService: MatSnackBar,
              private publishedIncidentService: PublishedIncidentService,
              protected cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.url = this.appConfigService.getConfig().application.baseUrl.toString() + this.router.url.slice(1)
    this.snowPlowHelper(this.url)
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
    const activeFoNIncidents = await this.publishedIncidentService.fetchPublishedIncidents(0, 9999, true, false).toPromise()
    const outIncidents = await this.publishedIncidentService.fetchOutIncidents(0, 9999).toPromise()

    this.outFires = outIncidents.collection.filter(f => f.stageOfControlCode === 'OUT')
    this.fires = activeIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT').concat(activeFoNIncidents.collection.filter(f => f.stageOfControlCode !== 'OUT'))

    this.firesLast24 = '' + (this.fires.filter(f => f.discoveryDate > Date.now() - 86400000).length + this.outFires.filter(f => f.discoveryDate > Date.now() - 86400000).length)
    this.firesLast7Days = '' + (this.fires.filter(f => f.discoveryDate > Date.now() - 604800000).length + this.outFires.filter(f => f.discoveryDate > Date.now() - 604800000).length)
    this.thisYearCount = '' + (this.fires.length + this.outFires.length)

    if (this.fires) {
      const fcData = []
      const fcAllData = []
      const fcStats = []

      for (const fire of this.fires) {
        this.fireValidator(fire)
      }

      for (const fire of this.outFires) {
        this.fireValidator(fire)
      }

      let fireYear = new Date().getFullYear()
      if (new Date().getMonth() < 3) fireYear -= 1

      for (const centre of FIRE_CENTRES) {
        const fireCount = this.fires.filter(f => f.fireCentreName && f.fireCentreName.includes(centre.name)).length
        const outFireCount = this.outFires.filter(f => f.fireCentreName && f.fireCentreName.includes(centre.name)).length
        fcData.push({
          name: centre.name,
          value: fireCount
        })
        fcAllData.push({
          name: centre.name,
          value: fireCount + outFireCount
        })

        const activeHectares = this.fires.filter(f => f.fireCentreName && f.fireCentreName.includes(centre.name) && f.fireYear === fireYear ).reduce((n, {incidentSizeMappedHa}) => n + incidentSizeMappedHa, 0);
        const outHectares = this.outFires.filter(f => f.fireCentreName && f.fireCentreName.includes(centre.name)).reduce((n, {incidentSizeMappedHa}) => n + incidentSizeMappedHa, 0);

        fcStats.push({
          name: centre.name,
          lightningStarts: activeIncidents.collection.filter(f => (f.fireCentreName && f.fireCentreName.includes(centre.name)) && f.discoveryDate > Date.now() - 86400000 && f.generalIncidentCauseCatId === 2).length + outIncidents.collection.filter(f => f.fireCentreCode === centre.id && f.discoveryDate > Date.now() - 86400000 && f.generalIncidentCauseCatId === 2).length,
          humanStarts: activeIncidents.collection.filter(f => (f.fireCentreName && f.fireCentreName.includes(centre.name)) && f.discoveryDate > Date.now() - 86400000 && f.generalIncidentCauseCatId === 1).length + outIncidents.collection.filter(f => f.fireCentreCode === centre.id && f.discoveryDate > Date.now() - 86400000 && f.generalIncidentCauseCatId === 1).length,
          totalFires: fireCount + outFireCount,
          areaBurned: activeHectares + outHectares
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
        const fireCount = this.fires.filter(f => f.stageOfControlCode === status.id || (f.fireOfNoteInd && status.id === 'NOTE' )).length
        if (status.id !== 'OUT') {
          statusData.push({
            name: status.name,
            value: fireCount
          })
        }
        statusAllData.push({
          name: status.name,
          value: status.id === 'OUT' ? this.outFires.length :  fireCount
        })
      }

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

  getFireYear (offset: number = 0) {
    if (new Date().getMonth() <= 2) {
      return new Date().getFullYear() - 1 + offset
    } else {
      return new Date().getFullYear() + offset
    }
  }

  getFiresByCentreTotals (includeOut = false): number {
    const arr = includeOut ? this.allFiresByCentre : this.activeFiresByCentre
    return arr && arr.length > 0 ? arr.map(r => r.value).reduce((p, n) => p + n) : 0
  }

  fireValidator (fire: any) {
    if (!fire.fireCentreName && (typeof fire.fireCentreCode === 'string' || fire.fireCentreCode instanceof String)) {
      fire.fireCentreName = fire.fireCentreCode
      fire.fireCentreCode = null
    }

    if (fire.fireCentreName && fire.fireCentreName.length < 3 && (typeof -fire.fireCentreName === 'number')) {
      fire.fireCentreCode = fire.fireCentreName
      fire.fireCentreName = FIRE_CENTRES.find(fc => fc.id === '' + fire.fireCentreCode).name
    }
  }
}

const FIRE_CENTRES = [
  { id: '2', name: 'Cariboo', displayOrder: 6 },
  { id: '50', name: 'Coastal', displayOrder: 1 },
  { id: '25', name: 'Kamloops', displayOrder: 4 },
  { id: '42', name: 'Northwest', displayOrder: 2 },
  { id: '34', name: 'Prince George', displayOrder: 3 },
  { id: '8', name: 'Southeast', displayOrder: 5 }
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
