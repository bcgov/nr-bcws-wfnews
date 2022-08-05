import { HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, Directive, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import * as moment from 'moment';
import { timestamp } from 'rxjs/operators';
import { fireCentreOption } from '../../conversion/models';
import { searchIncidents } from '../../store/incidents/incidents.action';
import { initIncidentsPaging } from '../../store/incidents/incidents.stats';
import { CollectionComponent } from '../common/base-collection/collection.component';
import { WfAdminPanelComponentModel } from './wf-admin-panel.component.model';

@Directive()
export class WfAdminPanelComponent extends CollectionComponent implements OnChanges,AfterViewInit {

  public currentYearString;
  public currentDateTimeString;

  displayLabel = "Simple Incidents Search"
  selectedFireCentreCode = "";
  fireCentreOptions : fireCentreOption[] = []

  initModels() {
    this.model = new WfAdminPanelComponentModel(this.sanitizer);
    this.viewModel = new WfAdminPanelComponentModel(this.sanitizer);
}

  loadPage() {
    // this.componentId = ADMIN_SEARCH_INCIDENTS_COMPONENT_ID;
    this.getFireCentres();
    this.getCurrentYearString()
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
        this.selectedFireCentreCode,this.displayLabel));
}

clearSearchAndFilters() {
  this.searchText = null;
  this.selectedFireCentreCode = null;
  super.onChangeFilters();
  this.doSearch();
}


  getViewModel(): WfAdminPanelComponentModel {
    return <WfAdminPanelComponentModel>this.viewModel;
}

  // ngOnInit(): void {
  //   this.getCurrentYearString();

  // }

  ngAfterViewInit() {
    super.ngAfterViewInit();
}

  ngOnchanges(changes: SimpleChanges) {
    super.ngOnChanges(changes)
  }

  getCurrentYearString(){
    this.currentYearString = new Date().getFullYear().toString() + "/" + (new Date().getFullYear()+1).toString();
    const todaysDate: Date = new Date();
    const options: Intl.DateTimeFormatOptions = {
       day: "numeric", month: "long", year: "numeric",
       hour: "numeric", minute: "2-digit"
    };
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayString = weekdays[todaysDate.getDay()];
    const liveDateTime: string  = (todayString + " " + todaysDate.toLocaleDateString("en-US", options)).replace(" at ", " - ");
    this.currentDateTimeString = liveDateTime
  }

  getFireCentres(){
        let url = this.appConfigService.getConfig().externalAppConfig['AGOLfireCentres'].toString();
        let headers = new HttpHeaders();
        headers.append('Access-Control-Allow-Origin','*');
        headers.append('Accept','*/*');
        this.http.get<any>(url,{headers}).subscribe(response => {
          if(response.features){
            response.features.forEach(element => {
              this.fireCentreOptions.push({code: element.attributes.FIRE_CENTRE_CODE, fireCentreName: element.attributes.FIRE_CENTRE})
            });
          }
        })
  }

  convertToDate(value: string) {
    if(value){
     return moment(value).format('YYYY-MM-DD hh:mm:ss')
    }
  }


}
//In this case : var time = moment(1382086394000).format("DD-MM-YYYY h:mm:ss");

