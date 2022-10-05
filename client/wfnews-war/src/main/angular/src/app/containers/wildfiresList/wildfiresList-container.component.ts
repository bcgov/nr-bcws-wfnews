import { Directive } from '@angular/core';
import { select } from '@ngrx/store';
import { SearchState } from '@wf1/core-ui';
import { Observable } from 'rxjs';
import { selectSearchState,selectWildfiresLoadState, selectWildfiresErrorState } from '../../store/application/application.selector';
import { ErrorState, LoadState } from '../../store/application/application.state';
import { selectCurrentWildfiresSearch } from '../../store/wildfiresList/wildfiresList.selector';
import { SEARCH_WILDFIRES_COMPONENT_ID } from '../../store/wildfiresList/wildfiresList.stats';
import { BaseContainer } from '../base/base-container.component';

@Directive()
export class WildfiresListContainer extends BaseContainer {
    collection$: Observable<any> = this.store.pipe(select(selectCurrentWildfiresSearch()));
    searchState$: Observable<SearchState> = this.store.pipe(select(selectSearchState(SEARCH_WILDFIRES_COMPONENT_ID)));
    loadState$: Observable<LoadState> = this.store.pipe(select(selectWildfiresLoadState()));
    errorState$: Observable<ErrorState[]> = this.store.pipe(select(selectWildfiresErrorState()));
}
