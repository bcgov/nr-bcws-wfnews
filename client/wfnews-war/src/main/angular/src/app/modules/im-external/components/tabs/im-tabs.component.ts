import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
// External
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
// Models
import { OpenIncident } from '../../models';
// Redux
import { RootState } from '../../../../store';
import * as IncidentActions from '../../../../store/im/im.actions';
import { MessageDialogComponent } from "../message-dialog/message-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { MessageType, WindowMessagingService } from "@wf1/core-ui";
import { selectSavedColumnsIM } from "../../../../store/im/im.selectors";
import { clearIMFormValidationState } from "../../../../store/validation/validation.actions";

@Component({
    selector: 'wfim-im-tabs',
    templateUrl: './im-tabs.component.html',
    styleUrls: ['./im-tabs.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IMTabsComponent implements OnInit, AfterViewInit {
    savedColumns$: Observable<string[]> = this.store.pipe(select(selectSavedColumnsIM()));

    tabs: OpenIncident[] = [];
    selectedTab: number = 0;
    loading: boolean = true;
    private storeActiveIncidentSub: Subscription;
    private storeOpenIncidentsSub: Subscription;
    private routeParamSub: Subscription;
    private listView: OpenIncident = { id: 'incident-list', label: 'Incident List' };
    private isActiveTabDirty: boolean = false;


    constructor(
        private store: Store<RootState>,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private messagingService: WindowMessagingService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnDestroy() {
        if (this.storeActiveIncidentSub) {
            this.storeActiveIncidentSub.unsubscribe();
        }

        if (this.storeOpenIncidentsSub) {
            this.storeOpenIncidentsSub.unsubscribe();
        }

        if (this.routeParamSub) {
            this.routeParamSub.unsubscribe();
        }
    }

    ngOnInit() {
        this.routeParamSub = this.routeParamSub ? this.routeParamSub : this.route.params.subscribe((params) => {
            if (params.wildfireYear && params.incidentNumberSequence) {
                this.store.dispatch(new IncidentActions.OpenIncidentTabAction({
                    wildfireYear: params.wildfireYear,
                    incidentNumberSequence: params.incidentNumberSequence
                }));
            }
        });
        this.setInitialTabs();
        this.subscribeOpenIncidents();
        this.subscribeLoading();
    }

    ngAfterViewInit() {
        this.subscribeWindowMessages();
    }

    subscribeWindowMessages() {
        this.messagingService.subscribeToMessageStream(
            message => {
                if (message.type === MessageType.ACTION) {
                    this.store.dispatch(message.action);
                } else {
                    console.warn('Unhandled message:', JSON.stringify(message));
                }
            }
        );
    }

    subscribeLoading() {
        this.store.pipe(select('incidentManagement', 'loading')).subscribe(loading => {
            this.loading = loading;
            this.cdr.detectChanges();
        });
    }

    setInitialTabs() {
        this.tabs = [this.listView];
    }

    subscribeOpenIncidents() {
        this.storeOpenIncidentsSub = this.storeOpenIncidentsSub ? this.storeOpenIncidentsSub : this.store.pipe(select('incidentManagement', 'openIncidents')).subscribe(
            (openIncidents: OpenIncident[]) => {
                if (this.tabs.length === 1 || this.tabs.length - 1 !== openIncidents.length) {
                    this.tabs = [this.listView, ...openIncidents];
                    this.selectTab(this.tabs.length - 1);
                } else {
                    for (let tab of this.tabs) {
                        if (tab !== this.listView) {
                            let updatedTab = openIncidents.find(currentIncident => currentIncident.id === tab.id);
                            console.log(updatedTab.etag);
                            tab.etag = updatedTab.etag;
                            tab.incident = updatedTab.incident;
                        }
                    }
                }
            }
        );
        this.storeActiveIncidentSub = this.storeActiveIncidentSub ? this.storeActiveIncidentSub : this.store.pipe(select('incidentManagement', 'activeIncidentId')).subscribe(
            activeIncidentId => {
                if (activeIncidentId) {
                    setTimeout(() => {
                        this.selectedTab = this.tabs.findIndex(openIncident => openIncident.id == activeIncidentId)
                    }, 0);
                } else {
                    this.selectedTab = 0;
                }
            });
    }

    selectTab(tabIndex) {
        const data = this.tabs[tabIndex];
        const openIncidentId = data && data.id ? data.id : undefined;
        this.store.dispatch(new IncidentActions.FocusOpenIncident(openIncidentId));
        this.cdr.detectChanges();
    }

    removeTab(tab: OpenIncident) {
        if (this.isActiveTabDirty) {
            let dialogRef = this.dialog.open(MessageDialogComponent, {
                width: '350px',
                data: {
                    title: 'Are you sure you want to continue?',
                    message: 'The current form has been edited. Changes you\'ve made may not be saved.',
                }
            });
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.store.dispatch(new IncidentActions.CloseIncidentTabAction(tab.id));
                    this.store.dispatch(clearIMFormValidationState(`${tab.incident.wildfireYear}${tab.incident.incidentNumberSequence}`));
                }
            });
        } else {
            this.store.dispatch(new IncidentActions.CloseIncidentTabAction(tab.id));
            this.store.dispatch(clearIMFormValidationState(`${tab.incident.wildfireYear}${tab.incident.incidentNumberSequence}`));
        }
        this.cdr.detectChanges();
    }

    updateFormState(isDirty: boolean) {
        this.isActiveTabDirty = isDirty;
    }

    isLoading(tab:any):boolean{
        if(tab && tab.incident){
            if(localStorage.getItem('isLoading'+tab.incident.incidentNumberSequence)){
                return true
            }else{
                return false
            }
        }
    }

}
