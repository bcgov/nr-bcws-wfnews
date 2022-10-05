import { HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Directive, OnChanges, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { fireCentreOption } from '../../conversion/models';
import { searchIncidents } from '../../store/incidents/incidents.action';
import { initIncidentsPaging, SEARCH_INCIDENTS_COMPONENT_ID } from '../../store/incidents/incidents.stats';
import { ResourcesRoutes } from '../../utils';
import { CollectionComponent } from '../common/base-collection/collection.component';
import { WfAdminPanelComponentModel } from './wf-admin-panel.component.model';

@Directive()
export class WfAdminPanelComponent extends CollectionComponent implements OnChanges, AfterViewInit {

  public currentYearString;
  public currentDateTimeString;

  displayLabel = 'Simple Incidents Search';
  selectedFireCentreCode = '';
  fireCentreOptions: fireCentreOption[] = [];
  fireOfNotePublishedInd = true;

  initModels() {
    this.model = new WfAdminPanelComponentModel(this.sanitizer);
    this.viewModel = new WfAdminPanelComponentModel(this.sanitizer);
  }

  loadPage() {
    this.componentId = SEARCH_INCIDENTS_COMPONENT_ID;
    this.getFireCentres();
    this.getCurrentYearString();
    this.updateView();
    this.initSortingAndPaging(initIncidentsPaging);
    this.config = this.getPagingConfig();
    this.baseRoute = this.router.url;
    this.doSearch();
  }

  doSearch() {
    this.store.dispatch(searchIncidents(this.componentId, {
      pageNumber: this.config.currentPage,
      pageRowCount: this.config.itemsPerPage,
      sortColumn: this.currentSort,
      sortDirection: this.currentSortDirection,
      query: this.searchText
    },
      this.selectedFireCentreCode, this.fireOfNotePublishedInd, this.displayLabel));
  }

  onChangeFilters() {
    super.onChangeFilters();
    this.doSearch();
  }

  clearSearchAndFilters() {
    this.searchText = null;
    this.selectedFireCentreCode = null;
    this.fireOfNotePublishedInd = true;
    super.onChangeFilters();
    this.doSearch();
  }


  getViewModel(): WfAdminPanelComponentModel {
    return <WfAdminPanelComponentModel>this.viewModel;
  }


  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  ngOnchanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
  }

  getCurrentYearString() {
    this.currentYearString = new Date().getFullYear().toString() + '/' + (new Date().getFullYear() + 1).toString();
    const todaysDate: Date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    };
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayString = weekdays[todaysDate.getDay()];
    const liveDateTime: string = (todayString + ' ' + todaysDate.toLocaleDateString('en-US', options)).replace(' at ', ' - ');
    this.currentDateTimeString = liveDateTime;
  }

  getFireCentres() {
    const url = this.appConfigService.getConfig().externalAppConfig['AGOLfireCentres'].toString();
    const headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Accept', '*/*');
    this.http.get<any>(url, { headers }).subscribe(response => {
      if (response.features) {
        response.features.forEach(element => {
          this.fireCentreOptions.push({ code: element.attributes.FIRE_CENTRE_CODE, fireCentreName: element.attributes.FIRE_CENTRE });
        });
      }
    });
  }

  convertToDate(value: string) {
    if (value) {
      return moment(value).format('YYYY-MM-DD hh:mm:ss');
    }
  }

  selectIncident(incident: any) {
    setTimeout(() => {
      this.router.navigate([ResourcesRoutes.ADMIN_INCIDENT], { queryParams: { wildFireYear: incident.wildfireYear, incidentNumberSequence: incident.incidentNumberSequence } });
    }, 100);
  }

  fireTypeChange(event: any) {
    this.fireOfNotePublishedInd = event.value === 'note';
    this.doSearch();
  }
}
