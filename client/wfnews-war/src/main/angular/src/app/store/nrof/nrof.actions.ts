// TODO MOVE THESE TO COMMON SPACE
// THIS SHOULD ONLY BE USED FOR DISPATCHING ACTIONS TO NROF APPLICATION
import {Action} from '@ngrx/store';
// Models
import {
  ProvisionalZoneListResource,
  ProvisionalZoneResource
} from '@wf1/incidents-rest-api';

export enum NROFActionTypes {
  OPEN_NROF_TAB = '[ Nrof ] Open nrof tab',
  NROF_SEARCH = '[ NROF ] Search',
  NROF_SEARCH_SUCCESS = '[ NROF ] Successful NROF search',
  NROF_SEARCH_ERROR = '[ NROF ] NROF search error',
  NORF_SEARCH_IGNORE = '[ NROF ] Search ignore action', // Fired when target component doesn't match

  LOAD_NROF = '[ NROF ] load nrof',
  LOAD_NROF_SUCCESS = '[ NROF ] load nrof success',
  LOAD_NROF_ERROR = '[ NROF ] load nrof error',

  POLLING_NROF = '[ NROF ] polling nrofs',
  POLLING_NROF_SUCCESS = '[ NROF ] polling nrofs success',
  POLLING_NROF_ERROR = '[ NROF ] error polling nrofs',
  POLLING_NROF_IGNORE = '[ NROF ] polling nrofs ignore action', // Fired when the nrof state is not properly initialized.

  POLLING_UNACKNOWLEDGED_NROF_COUNT = '[ NROF ] polling unacknowledged nrof count',
  POLLING_UNACKNOWLEDGED_NROF_COUNT_SUCCESS = '[ NROF ] polling unacknowledged nrof count success',
  POLLING_UNACKNOWLEDGED_NROF_COUNT_ERROR = '[ NROF ] polling unacknowledged nrof count nrofs',

  SYNC_NEW_NROFS = '[ NROF ] syncing new nrofs',
  SYNC_NEW_NROFS_COMPLETE = '[ NROF ] syncing nrofs complete',
  SYNC_NEW_NROFS_ERROR = '[ NROF ] syncing nrofs complete',

}

export class OpenNrofTabAction implements Action {
  type = NROFActionTypes.OPEN_NROF_TAB;
  constructor(public nrof: ProvisionalZoneResource | { provisionalZoneGuid: string}) {}
}

export class NROFSearchAction implements Action {
	type = NROFActionTypes.NROF_SEARCH;
	constructor(public componentId) {}
}

export class NROFSearchSuccessAction implements Action {
	type = NROFActionTypes.NROF_SEARCH_SUCCESS;
	constructor(public componentId, public response: ProvisionalZoneListResource) {}
}

export class NROFSearchErrorAction implements Action {
	type = NROFActionTypes.NROF_SEARCH_ERROR;
	constructor(public componentId) {
  }
}
export class NROFSearchIgnoreAction implements Action {
  type = NROFActionTypes.NORF_SEARCH_IGNORE;
  constructor() {}
}

export class NROFLoadAction implements Action {
  type = NROFActionTypes.LOAD_NROF;
  constructor(public provisionalZoneGuid: string, public silent?: boolean) {}
}

export class NROFLoadErrorAction implements Action {
  type = NROFActionTypes.LOAD_NROF_ERROR;
  constructor() {}
}

export class NROFLoadSuccessAction implements Action {
  type = NROFActionTypes.LOAD_NROF_SUCCESS;
  constructor(public response: ProvisionalZoneResource) {
  }
}

export class NROFPollingAction implements Action {
  type = NROFActionTypes.POLLING_NROF;
  constructor() {}
}

export class NROFPollingSuccessAction implements Action {
  type = NROFActionTypes.POLLING_NROF_SUCCESS;
  constructor(public response: ProvisionalZoneListResource, public searchState : any) {}
}

export class NROFPollingErrorAction implements Action {
  type = NROFActionTypes.POLLING_NROF_ERROR;
  constructor() {}
}

export class NROFPollingIgnoreAction implements Action {
  type = NROFActionTypes.POLLING_NROF_IGNORE;
  constructor() {}
}

export class UnacknowledgedNROFPollingCountAction implements Action {
  type = NROFActionTypes.POLLING_UNACKNOWLEDGED_NROF_COUNT;
  constructor() {}
}

export class UnacknowledgedNROFPollingCountSuccessAction implements Action {
  type = NROFActionTypes.POLLING_UNACKNOWLEDGED_NROF_COUNT_SUCCESS;
  constructor(public count: number) {}
}

export class UnacknowledgedNROFPollingErrorAction implements Action {
  type = NROFActionTypes.POLLING_UNACKNOWLEDGED_NROF_COUNT_ERROR;
  constructor() {}
}

export class NROFSyncAction implements Action {
  type = NROFActionTypes.SYNC_NEW_NROFS;
  constructor( public nrofs: ProvisionalZoneResource[]) {}
}

export class NROFSyncCompleteAction implements Action {
  type = NROFActionTypes.SYNC_NEW_NROFS_COMPLETE;
  constructor() {}
}

export class NROFSyncErrorAction implements Action {
  type = NROFActionTypes.SYNC_NEW_NROFS_ERROR;
  constructor() {}
}


