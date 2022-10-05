import { Directive } from '@angular/core';
import { select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectCurrentIncident, selectCurrentIncidentCause } from '../../store/incident/incident.selector';
import { BaseContainer } from '../base/base-container.component';

@Directive()
export class IncidentContainer extends BaseContainer {
    adminIncident$: Observable<any> = this.store.pipe(select(selectCurrentIncident()));
    adminIncidentCause$: Observable<any> = this.store.pipe(select(selectCurrentIncidentCause()));

}
