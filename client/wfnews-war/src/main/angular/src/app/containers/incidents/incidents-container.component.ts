import { Directive } from "@angular/core";
import { Observable } from "rxjs";
import { selectIncidents } from "../../store/incidents/incidents.selectors";
import { BaseContainer } from "../base/base-container.component";
import {select} from "@ngrx/store";
import { ErrorState, LoadState } from "../../store/application/application.state";
import { selectIncidentsErrorState, selectIncidentsLoadState } from "../../store/application/application.selector";


@Directive()
export class IncidentsContainer extends BaseContainer {
    incidents$: Observable<any> = this.store.pipe(select(selectIncidents()));
    loadState$: Observable<LoadState> = this.store.pipe(select(selectIncidentsLoadState()));
    errorState$: Observable<ErrorState[]> = this.store.pipe(select(selectIncidentsErrorState()));
}
