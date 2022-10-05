import { Directive } from '@angular/core';
import { select } from '@ngrx/store';
import { SearchState } from '@wf1/core-ui';
import { Observable } from 'rxjs';
import { selectSearchState, selectIncidentsErrorState, selectIncidentsLoadState } from '../../store/application/application.selector';
import { ErrorState, LoadState } from '../../store/application/application.state';
import { selectCurrentIncidentsSearch } from '../../store/incidents/incidents.selector';
import { SEARCH_INCIDENTS_COMPONENT_ID } from '../../store/incidents/incidents.stats';
import { BaseContainer } from '../base/base-container.component';

@Directive()
export class AdminContainer extends BaseContainer {
    collection$: Observable<any> = this.store.pipe(select(selectCurrentIncidentsSearch()));
    searchState$: Observable<SearchState> = this.store.pipe(select(selectSearchState(SEARCH_INCIDENTS_COMPONENT_ID)));
    loadState$: Observable<LoadState> = this.store.pipe(select(selectIncidentsLoadState()));
    errorState$: Observable<ErrorState[]> = this.store.pipe(select(selectIncidentsErrorState()));
}
