import { AfterViewInit, Component, Directive, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
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

  dataSource: any[] = [
    {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
    {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
    {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
    {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
    {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
    {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
    {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
  ];

  initModels() {
    this.model = new WfAdminPanelComponentModel(this.sanitizer);
    this.viewModel = new WfAdminPanelComponentModel(this.sanitizer);
}

  loadPage() {
    // this.componentId = ADMIN_SEARCH_INCIDENTS_COMPONENT_ID;
    console.log('wq')
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

}
