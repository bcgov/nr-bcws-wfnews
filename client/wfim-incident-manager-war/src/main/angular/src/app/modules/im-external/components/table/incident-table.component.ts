import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
// External
import * as moment from 'moment';
import { select, Store } from '@ngrx/store';
// Models
import {
    DuplexRadioFrequencyResource,
    SimplexRadioFrequencyResource,
    WildfireIncidentResource
} from '@wf1/incidents-rest-api';
import { Sort } from '@angular/material/sort';
import {
    DefaultSort,
    FilterConfig,
    ReportDialogComponent,
    SearchActions,
    SortDirection,
    SpatialUtilsService
} from '@wf1/core-ui';
// Redux
import { RootState } from '../../../../store';
import * as IncidentActions from '../../../../store/im/im.actions';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectableWildfireIncidentResource } from '../../models/selectable-wildfire-incident-resource';
import { INCIDENT_COMPONENT_ID } from "../../../../store/im/im.state";
import {
    ColumnConfig,
    formatFilter,
    formatFilterOptions,
    getCodeLabel,
    getCodeOptions, getIncidentStatusOptions,
    getOrgCodeOptions,
    getZoneOptions,
    isEmpty
} from "../../../../utils";
import { Subscription } from "rxjs";
import { CdkDragStart, CdkDropList, moveItemInArray } from "@angular/cdk/drag-drop";
import {
    selectCurrentlyEditingIncidentResource,
    selectCurrentlyEditingIncidentResourceEtag
} from "../../../../store/im/im.selectors";
import { saveUserPrefs, updateColumnConfig } from "../../../../store/searchAndConfig/search-and-config.actions";
import { Option } from "../../../../store/code-data/code-data.state";

export interface Filters {
    wildfireYear?: [string];
    center?: [string];
    zone?: [string];
    incidentTypeCode?: [string];
    stageOfControlCode?: [string];
    incidentStatusCode?: [string];
    suspectedCauseCategoryCode?: [string];
    incidentCommanderSignOffInd?: [string];
    zoneWildfireOfficerSignOffInd?: [string];
    fireCentreOrgUnitIdentifier?: [string];
    zoneOrgUnitIdentifier?: [string];
}

@Component({
    selector: 'wfim-incident-table',
    templateUrl: './incident-table.component.html',
    styleUrls: ['./incident-table.component.scss']
})
export class IncidentTableComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    editingRsrc: WildfireIncidentResource;
    editingRsrcEtag: string;
    editMode = false;
    hoveringRowIndex = -1;

    @Input() savedColumns: string[];

    @ViewChild('columnsSelect', { static: true }) columnsSelect: any;

    public TOOLTIP_DELAY = 500;
    resultsNum = 0;
    componentId = INCIDENT_COMPONENT_ID;
    readonly dateFormat: string = 'YYYY/MM/DD';
    loading = true;
    //incidents: SelectableWildfireIncidentResource[] = [];
    incidentsDatasource: MatTableDataSource<SelectableWildfireIncidentResource> = new MatTableDataSource([]);
    currentFilters: Filters = {};

    // tableDef: IncidentColumnDef[] = [];
    // tableHeaders: string[] = ['incidentSelect', 'incidentYear', 'incidentLabel', 'incidentTypeCode'
    //   , 'fireCentreOrgUnitName', 'zoneOrgUnitName', 'stageOfControlCode', 'latLong'
    // 	, 'geographicDescription', 'siteAccessPointTypeCode', 'incidentCommanderName', 'discoveryDate', 'containedPercentage', 'fireOutDate'
    // 	, 'fireSizeHectares', 'suspectedCauseCategoryCode', 'interfaceFireInd', 'valuesAtRiskDescription', 'simplexChannelColour', 'duplexChannelColour'
    // 	, 'incidentCommanderSignatureDate', 'zoneWildfireOfficerSignatureDate'];

    COLUMN_DEF_YEAR = "wildfireYear";
    COLUMN_DEF_LABEL = "incidentLabel";
    COLUMN_DEF_TYPE = "incidentTypeCode";
    COLUMN_DEF_CENTRE = "fireCentreOrgUnitName";
    COLUMN_DEF_ZONE = "zoneOrgUnitName";
    COLUMN_DEF_STATUS = "incidentStatusCode";
    COLUMN_DEF_STAGE = "stageOfControlCode";
    COLUMN_DEF_LAT_LONG = "latLong";
    COLUMN_DEF_GEO_DESCR = "geographicDescription";
    COLUMN_DEF_ACCESS = "siteAccessPointTypeCode";
    COLUMN_DEF_CMDR_NAME = "incidentCommanderName";
    COLUMN_DEF_DISC_DATE = "discoveryDate";
    COLUMN_DEF_CONT_PERC = "incidentSituation.containedPercentage";
    COLUMN_DEF_OUT_DATE = "incidentSituation.fireOutDate";
    COLUMN_DEF_SIZE_HECT = "incidentSituation.fireSizeHectares";
    COLUMN_DEF_SUSP_CAUSE = "suspectedCauseCategoryCode";
    COLUMN_DEF_INTERFACE_IND = "incidentSituation.interfaceFireInd";
    COLUMN_DEF_VAL_RISK_DESCR = "incidentSituation.valuesAtRiskDescription";
    COLUMN_DEF_SIMPLEX = "simplexChannelColour";
    COLUMN_DEF_DUPLEX = "duplexChannelColour";
    COLUMN_DEF_CMDR_SIG_DATE = "incidentCommanderSignatureDate";
    COLUMN_DEF_ZONE_OFFCR_SIG_DATE = "zoneWildfireOfficerSignatureDate";

    allColumns: ColumnConfig[] = [];
    columns: ColumnConfig[] = [];
    selectedColumns: string[] = [];
    editingValue: any;
    editingRowIndex = -1;
    editingColumnIndex = -1;
    columnsToDisplay = [];
    previousIndex: number;

    summaryIncidentReportName = '/NRSRS/WFIM/Reports/WFIM001_Summary_Incident_Export';
    detailedIncidentReportName = '/NRSRS/WFIM/Reports/WFIM002_Detailed_Incident_Export';
    incidentTableReportName = '/NRSRS/WFIM/Reports/WFIM003_Table_Export';


    readonly defaultSort: DefaultSort = { param: 'discoveryDate', direction: 'DESC' };
    readonly defaultActiveFilters = {
        stageOfControlCode: ['OUT_CNTRL', 'HOLDING', 'UNDR_CNTRL', 'UNKNOWN'],
        wildfireYear: ['' + new Date().getFullYear(), '' + (new Date().getFullYear() - 1)]
    };
    readonly defaultHiddenFilters = { incidentCategoryCode: ['FIRE_RESP'] };

    filterOptions: FilterConfig[] = [];
    isShowingFilterOptions = false;
    firstLoad = true;
    //codeTablesSub: Subscription;
    loadingSub: Subscription;
    //codeIndexSub: Subscription;
    incidentsSub: Subscription;
    filtersSub: Subscription;
    //codeDataSub: Subscription;
    editingRsrcSub: Subscription;
    editingRsrcEtagSub: Subscription;
    //savedColumnsSub: Subscription;

    selectableIncidents: SelectableWildfireIncidentResource[];

    constructor(
        private store: Store<RootState>,
        private spatialUtils: SpatialUtilsService,
        public dialog: MatDialog,
        public cdr: ChangeDetectorRef
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.savedColumns) {
            this.savedColumns = changes.savedColumns.currentValue;
        }
    }

    ngOnDestroy(): void {
        if (this.loadingSub) {
            this.loadingSub.unsubscribe();
        }
        if (this.incidentsSub) {
            this.incidentsSub.unsubscribe();
        }
        if (this.filtersSub) {
            this.filtersSub.unsubscribe();
        }
        if (this.editingRsrcSub) {
            this.editingRsrcSub.unsubscribe();
        }
        if (this.editingRsrcEtagSub) {
            this.editingRsrcEtagSub.unsubscribe();
        }
    }

    ngOnInit() {
        this.getCodeDataFilters();
        this.subscribeLoading();
        this.initColumns();
        this.subscribeEditingRsrc();
    }

    initColumns() {
        this.allColumns = [
            { def: this.COLUMN_DEF_YEAR, label: "Year", type: "string", editable: false, index: 0, sortable: true },
            { def: this.COLUMN_DEF_LABEL, label: "Incident Number", type: "string", editable: false, index: 0, sortable: true },
            { def: this.COLUMN_DEF_TYPE, label: "Incident Type", type: "options", editable: true, index: 0, options: formatFilterOptions(getCodeOptions('INCIDENT_TYPE_CODE')), sortable: true },
            { def: this.COLUMN_DEF_CENTRE, label: "Centre", type: "string", editable: false, index: 0, sortable: true },
            { def: this.COLUMN_DEF_ZONE, label: "Zone", type: "options", editable: true, index: 0, options: formatFilterOptions(getOrgCodeOptions('ZONE_CODE')), sortable: true },
            { def: this.COLUMN_DEF_STATUS, label: "Status", type: "options", editable: true, index: 0, options: formatFilterOptions(getCodeOptions('INCIDENT_STATUS_CODE')), sortable: true },
            { def: this.COLUMN_DEF_STAGE, label: "Stage of Control", type: "options", editable: true, index: 0, options: formatFilterOptions(getCodeOptions('STAGE_OF_CONTROL_CODE')), sortable: true },
            { def: this.COLUMN_DEF_LAT_LONG, label: "Lat. / Long.", type: "string", editable: true, index: 0 },
            { def: this.COLUMN_DEF_GEO_DESCR, label: "Geographic Location", type: "string", editable: true, index: 0, sortable: true },
            { def: this.COLUMN_DEF_ACCESS, label: "Access", type: "string", editable: false, index: 0 },
            { def: this.COLUMN_DEF_CMDR_NAME, label: "Incident Commander", type: "string", editable: true, index: 0, sortable: true },
            { def: this.COLUMN_DEF_DISC_DATE, label: "Discovery Date", type: "string", editable: false, index: 0, sortable: true },
            { def: this.COLUMN_DEF_CONT_PERC, label: "% Contained", type: "string", editable: true, index: 0, sortable: true },
            { def: this.COLUMN_DEF_OUT_DATE, label: "Fire Out Date", type: "string", editable: false, index: 0, sortable: true },
            { def: this.COLUMN_DEF_SIZE_HECT, label: "Size", type: "string", editable: true, index: 0, sortable: true },
            { def: this.COLUMN_DEF_SUSP_CAUSE, label: "General Cause", type: "options", editable: true, index: 0, options: formatFilterOptions(getCodeOptions('GENERAL_INCIDENT_CAUSE_CAT_CODE')), sortable: true },
            { def: this.COLUMN_DEF_INTERFACE_IND, label: "Interface", type: "string", editable: false, index: 0, sortable: true },
            { def: this.COLUMN_DEF_VAL_RISK_DESCR, label: "Values at Risk", type: "string", editable: false, index: 0, sortable: true },
            { def: this.COLUMN_DEF_SIMPLEX, label: "Radio Simplex", type: "string", editable: false, index: 0 },
            { def: this.COLUMN_DEF_DUPLEX, label: "Radio Duplex", type: "string", editable: false, index: 0 },
            { def: this.COLUMN_DEF_CMDR_SIG_DATE, label: "IC Sign Off", type: "string", editable: false, index: 0, sortable: true },
            { def: this.COLUMN_DEF_ZONE_OFFCR_SIG_DATE, label: "WO Sign Off", type: "string", editable: false, index: 0, sortable: true },
        ];
        this.columns = [];
        this.selectedColumns = [];
        if (this.savedColumns && this.savedColumns.length > 0) {
            this.savedColumns.forEach(colDef => {
                let colConf = this.allColumns.find(conf => conf.def == colDef);
                if (colConf) {
                    this.columns.push(colConf);
                }

                this.selectedColumns.push(colDef);
            });
        } else {
            this.allColumns.forEach(conf => {
                this.columns.push(conf);
                this.selectedColumns.push(conf.def);
            });
        }
        this.setDisplayedColumns();

    }

    ngAfterViewInit() {
        this.getIncidents();

    }

    subscribeLoading() {
        this.loadingSub = this.loadingSub ? this.loadingSub : this.store.pipe(select('incidentManagement', 'loading')).subscribe(loading => {
            if (loading) {
                this.selectableIncidents = [];
                this.incidentsDatasource.data = [];
            }
            this.loading = loading;
            this.cdr.detectChanges();
        });
    }

    subscribeEditingRsrc() {
        this.editingRsrcSub = this.editingRsrcSub ? this.editingRsrcSub : this.store.pipe(select(selectCurrentlyEditingIncidentResource())).subscribe(editingRsrc => {
            this.editingRsrc = editingRsrc;
        });

        this.editingRsrcEtagSub = this.editingRsrcEtagSub ? this.editingRsrcEtagSub : this.store.pipe(select(selectCurrentlyEditingIncidentResourceEtag())).subscribe(editingRsrcEtag => {
            this.editingRsrcEtag = editingRsrcEtag;
        });
    }

    getIncidents() {
        this.store.dispatch(new IncidentActions.IncidentSearchAction(this.componentId));
        this.incidentsSub = this.incidentsSub ? this.incidentsSub : this.store.pipe(select('incidentManagement', 'incidents')).subscribe(
            (incidents: WildfireIncidentResource[]) => {
                this.selectableIncidents = incidents.map(incident => {
                    let selectableIncident = new SelectableWildfireIncidentResource(incident);
                    this.populateDisplayValues(selectableIncident);
                    return selectableIncident;
                });
                this.updateTableDataSource();

                //this.incidentsDatasource.data = this.incidents;
                this.resultsNum = this.incidentsDatasource.data.length;
            }
        );
    }

    populateDisplayValues(selectableIncident: SelectableWildfireIncidentResource) {
        if (selectableIncident) {
            let incident = selectableIncident.incidentResource;
            selectableIncident.displayIncidentType = this.getLabel('INCIDENT_TYPE_CODE', incident.incidentTypeCode);
            selectableIncident.displayStageOfControl = incident.incidentLocation ? this.getLabel('STAGE_OF_CONTROL_CODE', incident.incidentSituation.stageOfControlCode) : '';
            selectableIncident.displayIncidentLocation = this.formatCoordinates(incident.incidentLocation);
            selectableIncident.displayGeographicDescription = incident.incidentLocation ? incident.incidentLocation.geographicDescription : '';
            selectableIncident.displaySiteAccessPointType = incident.incidentSituation ? this.getLabel('SITE_ACCESS_POINT_TYPE_CODE', incident.incidentSituation.siteAccessPointTypeCode) : '';
            selectableIncident.displayDiscoveryDate = this.formatDate(incident.discoveryTimestamp, this.dateFormat);
            selectableIncident.displayIncidentStatus = this.getLabel('INCIDENT_STATUS_CODE', incident.incidentStatusCode);
            selectableIncident.displayFireOutDate = this.formatDate(incident.incidentSituation.fireOutDate, this.dateFormat);
            selectableIncident.displayInterface = this.getBooleanLabel(incident.incidentSituation.interfaceFireInd);
            selectableIncident.displaySimplexRadioFrequency = this.formatSimplexFrequencyColumn(incident.simplexRadioFrequency);
            selectableIncident.displayDuplexRadioFrequency = this.formatDuplexFrequencyColumn(incident.duplexRadioFrequency);
            selectableIncident.displaySignOffSignatureDate = this.formatDate(incident.signOffSignatureDate, this.dateFormat);
            selectableIncident.displayApprovalSignatureDate = this.formatDate(incident.approvalSignatureDate, this.dateFormat);
        }
    }


    openIncident(index) {
        this.store.dispatch(new IncidentActions.OpenIncidentTabAction(this.selectableIncidents[index].incidentResource));
        //this.cdr.markForCheck();
    }

    sortData({ active, direction }: Sort) {
        this.store.dispatch(new SearchActions.UpdateSortAction(active, direction.toUpperCase() as SortDirection, this.componentId));
    }

    getLabel(table: string, value: string): string {
        return getCodeLabel(table, value);
    }

    getBooleanLabel(value: boolean): 'Yes' | 'No' | '' {
        if (value == null || value == undefined) {
            return '';
        }
        return value ? 'Yes' : 'No';
    }

    formatDate(date: Date, format: string): string {
        //console.log('format date call');
        return date ? moment(date).format(format) : '';
    }

    formatSimplexFrequencyColumn(simplex: SimplexRadioFrequencyResource) {
        //console.log('format simplex');
        return simplex ? [simplex.channelColour, simplex.frequencyMhz].filter(value => value !== null).join(", ") : '';
    }

    formatDuplexFrequencyColumn(duplex: DuplexRadioFrequencyResource) {
        //console.log('format duplex');
        return duplex ? [duplex.channelColour, duplex.toneNumber].filter(value => value !== null).join(", ") : '';
    }

    selectAllIncidents(toggleValue: boolean) {
        if (this.incidentsDatasource && this.incidentsDatasource.data && this.incidentsDatasource.data.length > 0) {
            this.incidentsDatasource.data.forEach(item => {
                item.isSelected = toggleValue;
            });
        }
    }

    selectIncident(rowIndex: number) {
        this.incidentsDatasource.data[rowIndex].isSelected = !this.incidentsDatasource.data[rowIndex].isSelected;
    }

    showIncidentDetailReportDialog() {
        const filteredList = this.incidentsDatasource.data.filter((incident) => incident.isSelected);
        const incidentIds = filteredList.map(
            (incident: SelectableWildfireIncidentResource) =>
                `${incident['wildfireYear']}-${incident['incidentNumberSequence']}`
        );

        this.dialog.open(ReportDialogComponent, {
            width: '850px',
            maxWidth: '850px',
            data: {
                elementId: 'visualize-container',
                reportPath: this.detailedIncidentReportName,
                reportParams: { 'P_YEAR_NUMBER_SEQUENCE': incidentIds },
                supportedExportFormats: ['pdf']
            }
        });
    }

    showSummaryIncidentReportDialog() {
        const summaryIncidentReportParams = {
            'P_FIRE_YEAR': this.currentFilters.wildfireYear ? this.currentFilters.wildfireYear : [],
            'P_FIRE_CENTRE': this.currentFilters.fireCentreOrgUnitIdentifier ? this.currentFilters.fireCentreOrgUnitIdentifier : [],
            'P_ZONE': this.currentFilters.zoneOrgUnitIdentifier ? this.currentFilters.zoneOrgUnitIdentifier : [],
            'P_INCIDENT_TYPE': this.currentFilters.incidentTypeCode ? this.currentFilters.incidentTypeCode : [],
            'P_STAGE_OF_CONTROL': this.currentFilters.stageOfControlCode ? this.currentFilters.stageOfControlCode : [],
            'P_INCIDENT_STATUS': this.currentFilters.incidentStatusCode ? this.currentFilters.incidentStatusCode : [],
            'P_GENERAL_CAUSE': this.currentFilters.suspectedCauseCategoryCode ? this.currentFilters.suspectedCauseCategoryCode : [],
            'P_IC_SIGN_OFF_IND': [this.getReportIndicatorValue(this.currentFilters.incidentCommanderSignOffInd)],
            'P_ZWO_SIGN_OFF_IND': [this.getReportIndicatorValue(this.currentFilters.zoneWildfireOfficerSignOffInd)]
        };
        this.dialog.open(ReportDialogComponent, {
            width: '850px',
            maxWidth: '850px',
            data: {
                elementId: 'visualize-container',
                reportPath: this.summaryIncidentReportName,
                reportParams: summaryIncidentReportParams,
                supportedExportFormats: ['pdf', 'csv']
            }
        });
    }

    showTableExportReportDialog() {
        const incidentTableReportParams = {
            'P_FIRE_YEAR': this.currentFilters.wildfireYear ? this.currentFilters.wildfireYear : [],
            'P_FIRE_CENTRE': this.currentFilters.fireCentreOrgUnitIdentifier ? this.currentFilters.fireCentreOrgUnitIdentifier : [],
            'P_ZONE': this.currentFilters.zoneOrgUnitIdentifier ? this.currentFilters.zoneOrgUnitIdentifier : [],
            'P_STAGE_OF_CONTROL': this.currentFilters.stageOfControlCode ? this.currentFilters.stageOfControlCode : [],
            'P_INCIDENT_TYPE': this.currentFilters.incidentTypeCode ? this.currentFilters.incidentTypeCode : [],
            'P_INCIDENT_STATUS': this.currentFilters.incidentStatusCode ? this.currentFilters.incidentStatusCode : [],
            'P_GENERAL_CAUSE': this.currentFilters.suspectedCauseCategoryCode ? this.currentFilters.suspectedCauseCategoryCode : [],
            'P_IC_SIGN_OFF_IND': [this.getReportIndicatorValue(this.currentFilters.incidentCommanderSignOffInd)],
            'P_ZWO_SIGN_OFF_IND': [this.getReportIndicatorValue(this.currentFilters.zoneWildfireOfficerSignOffInd)]
        };

        this.dialog.open(ReportDialogComponent, {
            width: '850px',
            maxWidth: '850px',
            data: {
                elementId: 'visualize-container',
                reportPath: this.incidentTableReportName,
                reportParams: incidentTableReportParams,
                supportedExportFormats: ['pdf', 'csv']
            }
        });
    }

    getReportIndicatorValue(values: [string]) {
        if (values && values.length > 0) {
            const yes = values.includes('true');
            const no = values.includes('false');

            if (yes && no) return;
            if (yes) return 'Yes';
            if (no) return 'No';
        }
        return;
    }

    getTableControlsClasses(): string {
        return (this.isShowingFilterOptions) ? 'filter-table__controls with-filter-content' : 'filter-table__controls without-filter-content';
    }

    getTableContentClasses(): string {
        //console.log('getTableContentClasses');
        return (this.isShowingFilterOptions) ? 'table-with-filters-and-filter-content' : 'table-with-filters';
    }

    setFilterSize(isShowingFilterOptions: boolean) {
        this.isShowingFilterOptions = isShowingFilterOptions;
    }

    setDefaultFilters() {
        // TODO improve on this - timeout is set for direct route access, UI checkboxes do not get selected along with filters without timeout
        setTimeout(() => {
            this.store.dispatch(new SearchActions.UpdateActiveFiltersAction(this.defaultActiveFilters, this.componentId));
            this.store.dispatch(new SearchActions.UpdateHiddenFiltersAction(this.defaultHiddenFilters, this.componentId));
        }, 0);
    }

    setDefaultSort() {
        this.store.dispatch(new SearchActions.UpdateSortAction(this.defaultSort.param, this.defaultSort.direction, this.componentId));
    }

    getCodeDataFilters() {
        this.filterOptions = [
            this.formatYearFilter('Year', 'wildfireYear', 10),
            formatFilter('Type', 'incidentTypeCode', formatFilterOptions(getCodeOptions('INCIDENT_TYPE_CODE'))),
            formatFilter('Status', 'incidentStatusCode', formatFilterOptions(getIncidentStatusOptions())),
            formatFilter('Stage of Control', 'stageOfControlCode', formatFilterOptions(getCodeOptions('STAGE_OF_CONTROL_CODE'))),
            formatFilter('Fire Centre', 'fireCentreOrgUnitIdentifier', formatFilterOptions(getOrgCodeOptions('FIRE_CENTRE_CODE'))),
            formatFilter('Fire Zone', 'zoneOrgUnitIdentifier', formatFilterOptions(getOrgCodeOptions('ZONE_CODE'))),
            formatFilter('General Cause', 'suspectedCauseCategoryCode', formatFilterOptions(getCodeOptions('GENERAL_INCIDENT_CAUSE_CAT_CODE'))),
            formatFilter('IC Sign Off', 'incidentCommanderSignOffInd', this.getBooleanFiltersOptions()),
            formatFilter('WO Sign Off', 'zoneWildfireOfficerSignOffInd', this.getBooleanFiltersOptions())
        ];

        this.subscribeSearchFilter();
    }

    subscribeSearchFilter() {

        this.filtersSub = this.filtersSub ? this.filtersSub : this.store.pipe(select(INCIDENT_COMPONENT_ID, 'filters')).subscribe(
            filters => {
                this.currentFilters = filters;
                if (this.firstLoad) {
                    if (!filters || isEmpty(filters)) {
                        this.setDefaultSort();
                        this.setDefaultFilters();
                    }
                }
                const zoneOrgUnitIndex = this.filterOptions.findIndex((value) => value.param === 'zoneOrgUnitIdentifier');

                let zones = getZoneOptions(this.store, this.componentId, filters, this.filterOptions, this.firstLoad);
                this.filterOptions[zoneOrgUnitIndex].options = formatFilterOptions(zones);

                // this seeming no-op tricks the change detection into seeing filterOptions as different 
                this.filterOptions = [].concat( this.filterOptions )

                this.cdr.markForCheck()

                if (this.firstLoad) {
                    this.firstLoad = false;
                    this.store.dispatch(new SearchActions.UpdateActiveFiltersAction(filters, this.componentId));
                }

                //this.cdr.detectChanges();
            }
        );
    }

    formatCoordinates(incidentLocation) {
        return incidentLocation && incidentLocation.longitude && incidentLocation.latitude ?
            this.spatialUtils.formatCoordinates([incidentLocation.longitude, incidentLocation.latitude]) : '';
    }


    formatYearFilter(label: string, param: string, yearCount: number) {
        const currentYear = new Date().getFullYear();

        const filterData: Option[] = [];
        for (let diff = 0; diff < yearCount; diff++) {
            const year = currentYear - diff;
            filterData.push({ description: `${year}`, code: `${year}` })
        }

        return formatFilter(label, param, formatFilterOptions(filterData));
    }

    getBooleanFiltersOptions() {
        return [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' }
        ];
    }


    //-----
    updateTableDataSource() {
        let tableCache = [];
        this.selectableIncidents.forEach(inc => {
            let row = [];
            this.columnsToDisplay.forEach(col => {
                row.push(this.getRowValue(inc, col, true));
            });

            row['wildfireYear'] = inc.incidentResource.wildfireYear;
            row['incidentNumberSequence'] = inc.incidentResource.incidentNumberSequence;
            tableCache.push(row);
        });
        this.incidentsDatasource.data = tableCache;
        this.cdr.detectChanges();
    }

    getRowValue(row: SelectableWildfireIncidentResource, field, resolveCodeDesriptions?: boolean): string | number {
        let rowVal = null;
        switch (field) {
            case this.COLUMN_DEF_YEAR:
                rowVal = row.incidentResource.wildfireYear;
                break;
            case this.COLUMN_DEF_ACCESS:
                rowVal = row.displaySiteAccessPointType;
                break;
            case this.COLUMN_DEF_CENTRE:
                rowVal = row.incidentResource.fireCentreOrgUnitName;
                break;
            case this.COLUMN_DEF_CMDR_NAME:
                rowVal = row.incidentResource.incidentCommanderName;
                break;
            case this.COLUMN_DEF_CMDR_SIG_DATE:
                rowVal = row.displaySignOffSignatureDate;
                break;
            case this.COLUMN_DEF_CONT_PERC:
                rowVal = row.incidentResource.incidentSituation.containedPercentage;
                break;
            case this.COLUMN_DEF_DISC_DATE:
                rowVal = row.displayDiscoveryDate;
                break;
            case this.COLUMN_DEF_DUPLEX:
                rowVal = row.displayDuplexRadioFrequency;
                break;
            case this.COLUMN_DEF_GEO_DESCR:
                rowVal = row.displayGeographicDescription;
                break;
            case this.COLUMN_DEF_INTERFACE_IND:
                rowVal = row.displayInterface;
                break;
            case this.COLUMN_DEF_LABEL:
                rowVal = row.incidentResource.incidentLabel;
                break;
            case this.COLUMN_DEF_LAT_LONG:
                rowVal = row.displayIncidentLocation;
                break;
            case this.COLUMN_DEF_OUT_DATE:
                rowVal = row.displayFireOutDate;
                break;
            case this.COLUMN_DEF_SIMPLEX:
                rowVal = row.displaySimplexRadioFrequency;
                break;
            case this.COLUMN_DEF_SIZE_HECT:
                rowVal = row.incidentResource.incidentSituation.fireSizeHectares;
                break;
            case this.COLUMN_DEF_STAGE:
                rowVal = resolveCodeDesriptions ? row.displayStageOfControl : row.incidentResource.incidentSituation.stageOfControlCode;
                break;
            case this.COLUMN_DEF_SUSP_CAUSE:
                rowVal = row.incidentResource.suspectedCauseCategoryCode;
                break;
            case this.COLUMN_DEF_TYPE:
                rowVal = resolveCodeDesriptions ? row.displayIncidentType : row.incidentResource.incidentTypeCode;
                break;
            case this.COLUMN_DEF_VAL_RISK_DESCR:
                rowVal = row.incidentResource.incidentSituation.valuesAtRiskDescription;
                break;
            case this.COLUMN_DEF_ZONE:
                rowVal = resolveCodeDesriptions ? row.incidentResource.zoneOrgUnitName : row.incidentResource.zoneOrgUnitIdentifier;
                break;
            case this.COLUMN_DEF_ZONE_OFFCR_SIG_DATE:
                rowVal = row.displayApprovalSignatureDate;
                break;
            case this.COLUMN_DEF_STATUS:
                rowVal = row.incidentResource.incidentStatusCode;
                break;

            default:
                rowVal = '';
                break;
        }

        return rowVal;
    }

    getUpdatedRow(rsrc: WildfireIncidentResource, field): WildfireIncidentResource {
        let ret = rsrc;

        switch (field) {
            case this.COLUMN_DEF_CMDR_NAME:
                rsrc.incidentCommanderName = this.editingValue;
                break;
            case this.COLUMN_DEF_CONT_PERC:
                rsrc.incidentSituation.containedPercentage = this.editingValue;
                break;
            case this.COLUMN_DEF_GEO_DESCR:
                rsrc.incidentLocation.geographicDescription = this.editingValue;
                break;
            case this.COLUMN_DEF_LAT_LONG:
                let coordinates = this.spatialUtils.parseCoordinates(this.editingValue);
                if (coordinates) {
                    rsrc.incidentLocation.incidentLocationPoint = {
                        type: "Point",
                        coordinates
                    }
                }
                break;
            case this.COLUMN_DEF_SIZE_HECT:
                rsrc.incidentSituation.fireSizeHectares = this.editingValue;
                break;
            case this.COLUMN_DEF_STAGE:
                rsrc.incidentSituation.stageOfControlCode = this.editingValue;
                break;
            case this.COLUMN_DEF_SUSP_CAUSE:
                rsrc.suspectedCauseCategoryCode = this.editingValue;
                break;
            case this.COLUMN_DEF_TYPE:
                rsrc.incidentTypeCode = this.editingValue;
                break;
            case this.COLUMN_DEF_ZONE:
                rsrc.zoneOrgUnitName = this.editingValue;
                break;
            case this.COLUMN_DEF_STATUS:
                rsrc.incidentStatusCode = this.editingValue;
                break;

            default:
                break;
        }

        return rsrc;
    }

    dragStarted(event: CdkDragStart, index: number) {
        this.previousIndex = index;
    }

    dropListDropped(event: CdkDropList, index: number) {
        if (event) {
            moveItemInArray(this.columns, this.previousIndex, index);
            this.setDisplayedColumns();
            //this.cancelEdit();
        }
        this.saveColumnConfig();
    }

    saveColumnConfig() {
        let cols = Object.assign([], this.columnsToDisplay);
        cols.shift();
        this.store.dispatch(updateColumnConfig(this.componentId, cols));
        this.store.dispatch(saveUserPrefs(this.componentId));
    }

    setDisplayedColumns() {
        this.columnsToDisplay[0] = 'incidentSelect';
        this.columns.forEach((column, index) => {
            column.index = index;
            this.columnsToDisplay[index + 1] = column.def;
        });
        this.updateTableDataSource();
    }


    startEdit(col, row, field) {
        this.editingColumnIndex = col;
        this.editingRowIndex = row;
        this.editingRsrc = this.selectableIncidents[row].incidentResource;
        this.editingValue = this.getRowValue(this.selectableIncidents[row], field, false);
        this.store.dispatch(IncidentActions.selectIncidentForEditing(this.editingRsrc));
    }

    cancelEdit() {
        this.editingColumnIndex = -1;
        this.editingRowIndex = -1;
        this.store.dispatch(IncidentActions.unselectIncidentForEditing());
    }

    saveEdit(field, i, j, resetEditing: boolean) {
        if (this.editingRsrc && this.editingRsrcEtag) {
            let updatedVM = this.getUpdatedRow(this.editingRsrc, field);

            let selectableIncident = new SelectableWildfireIncidentResource(updatedVM);
            this.populateDisplayValues(selectableIncident);

            this.incidentsDatasource.data[j][i + 1] = this.getRowValue(selectableIncident, field, true);
            this.cdr.detectChanges();
            this.store.dispatch(new IncidentActions.UpdateIncidentAction(this.editingRsrcEtag, updatedVM));
            if (resetEditing) {
                this.editingColumnIndex = -1;
                this.editingRowIndex = -1;
            }
        }
    }

    navigateDown(event, field, i, j) {
        event.preventDefault();
        this.saveEdit(field, i, j, false);
        this.editingRowIndex++;
        if (this.editingRowIndex < this.selectableIncidents.length - 1) {
            this.editingRsrc = this.selectableIncidents[this.editingRowIndex].incidentResource;
            this.editingValue = this.getRowValue(this.selectableIncidents[this.editingRowIndex], field, false);
            this.store.dispatch(IncidentActions.selectIncidentForEditing(this.editingRsrc));
        }
    }

    navigateUp(event, field, i, j) {
        event.preventDefault();
        this.saveEdit(field, i, j, false);
        if (this.editingRowIndex != 0) {
            this.editingRowIndex--;
            this.editingRsrc = this.selectableIncidents[this.editingRowIndex].incidentResource;
            this.editingValue = this.getRowValue(this.selectableIncidents[this.editingRowIndex], field, false);
            this.store.dispatch(IncidentActions.selectIncidentForEditing(this.editingRsrc));
        }

    }

    updateColumnsToDisplay() {
        //remove columns no longer selected
        this.columns = this.columns.filter(col => this.selectedColumns.includes(col.def));

        //add selected columns that were not displayed before
        this.selectedColumns.forEach(col => {
            if (!this.columnsToDisplay.includes(col)) {
                let columnConfig = this.allColumns.find(colConfig => colConfig.def == col);
                if (columnConfig) {
                    this.columns.push(columnConfig);
                }
            }
        });
        //update display columns and indexes
        this.columnsToDisplay = [];
        this.columnsToDisplay[0] = 'incidentSelect';
        let colIndex = 1;
        this.columns.forEach(col => {
            col.index = colIndex;
            colIndex++;

            this.columnsToDisplay.push(col.def);
        });
        this.cancelEdit();
        this.columnsSelect.close();
        this.updateTableDataSource();
        this.saveColumnConfig();
    }

}
