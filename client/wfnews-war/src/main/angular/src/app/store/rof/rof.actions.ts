// TODO MOVE THESE TO COMMON SPACE
// THIS SHOULD ONLY BE USED FOR DISPATCHING ACTIONS TO ROF APPLICATION
import { Action } from '@ngrx/store';
import {
    PublicReportOfFireListResource,
    PublicReportOfFireResource,
    SimpleReportOfFireListResource
} from '@wf1/incidents-rest-api';
import { ROF_MAP_COMPONENT_ID } from "./rof.state";

export enum ROFActionTypes {
    ROF_SEARCH = '[ ROF ] Search',
    ROF_SEARCH_SUCCESS = '[ ROF ] Successful ROF search',
    ROF_SEARCH_ERROR = '[ ROF ] ROF search error',
    ROF_SEARCH_IGNORE = '[ ROF ] Search ignore action', // Fired when target component doesn't match

    LOAD_ROF = '[ ROF ] load rof',
    LOAD_ROF_SUCCESS = '[ ROF ] load rof success',
    LOAD_ROF_ERROR = '[ ROF ] load rof error',

    LOAD_ROF_COMMENTS = '[ ROF ] load rof comments',
    LOAD_ROF_COMMENTS_SUCCESS = '[ ROF ] load rof comments success',
    LOAD_ROF_COMMENTS_ERROR = '[ ROF ] load rof comments error',

    POLLING_ROF = '[ ROF ] polling rofs',
    POLLING_ROF_SUCCESS = '[ ROF ] polling rofs success',
    POLLING_ROF_ERROR = '[ ROF ] error polling rofs',
    POLLING_ROF_IGNORE = '[ ROF ] polling rofs ignore action', // Fired when the rof state is not properly initialized.

    SYNC_NEW_ROFS = '[ ROF ] syncing new rofs',
    SYNC_NEW_ROFS_COMPLETE = '[ ROF ] syncing rofs complete',
    SYNC_NEW_ROFS_ERROR = '[ ROF ] syncing rofs complete',

    UPDATE_ROF = '[ ROF ] update rof',
    UPDATE_ROF_SUCCESS = '[ ROF ] update rof success',
    UPDATE_ROF_ERROR = '[ ROF ] update rof error',

    REMOVE_ROF = '[ ROF ] remove rof',
    REMOVE_ROF_SUCCESS = '[ ROF ] remove rof success',
    REMOVE_ROF_ERROR = '[ ROF ] remove rof error',

    CREATE_ROF = '[ ROF ] create rof',
    CREATE_ROF_SUCCESS = '[ ROF ] create rof success',
    CREATE_ROF_ERROR = '[ ROF ] create rof error',

    OPEN_NEW_ROF = '[ ROF ] open new rof',
    OPEN_ROF = '[ ROF ] open rof tab',
    SET_ROF_STATE = '[ ROF ] set status of rof',
    CLOSE_OPEN_ROF = '[ ROF ] close open rof',

    GET_ROF = '[ ROF ] get rof',

    UPDATE_ROF_AUDIBLE_ALERT = '[ ROF ] update rof audible alert',
    UPDATE_ROF_AUDIBLE_ALERT_SUCCESS = '[ ROF ] update rof audible alert success',
    UPDATE_ROF_AUDIBLE_ALERT_ERROR = '[ ROF ] update rof audible alert error',
}

export class GetRof implements Action {
    type = ROFActionTypes.GET_ROF;
    constructor(public wildfireYear: string, public reportOfFireNumber: string) { }
}

export class ROFSearchAction implements Action {
    type = ROFActionTypes.ROF_SEARCH;
    constructor(public componentId) { }
}

export class ROFSearchSuccessAction implements Action {
    type = ROFActionTypes.ROF_SEARCH_SUCCESS;
    constructor(public componentId, public response: PublicReportOfFireListResource) { }
}

export class ROFSearchErrorAction implements Action {
    type = ROFActionTypes.ROF_SEARCH_ERROR;
    constructor() { }
}

export class ROFSearchIgnoreAction implements Action {
    type = ROFActionTypes.ROF_SEARCH_IGNORE;
    constructor() { }
}

export class ROFPollingAction implements Action {
    type = ROFActionTypes.POLLING_ROF;
    constructor() { }
}

export class ROFPollingSuccessAction implements Action {
    type = ROFActionTypes.POLLING_ROF_SUCCESS;
    constructor(public response: SimpleReportOfFireListResource, public searchState: any) { }
}

export class ROFPollingErrorAction implements Action {
    type = ROFActionTypes.POLLING_ROF_ERROR;
    constructor() { }
}

export class ROFPollingIgnoreAction implements Action {
    type = ROFActionTypes.POLLING_ROF_IGNORE;
    constructor() { }
}

// export class UnacknowledgedROFPollingCountAction implements Action {
//     type = ROFActionTypes.POLLING_UNACKNOWLEDGED_ROF_COUNT;
//     constructor() { }
// }

// export class UnacknowledgedROFPollingCountSuccessAction implements Action {
//     type = ROFActionTypes.POLLING_UNACKNOWLEDGED_ROF_COUNT_SUCCESS;
//     constructor(public count: number) { }
// }

// export class UnacknowledgedROFPollingErrorAction implements Action {
//     type = ROFActionTypes.POLLING_UNACKNOWLEDGED_ROF_COUNT_ERROR;
//     constructor() { }
// }

export class ROFSyncAction implements Action {
    type = ROFActionTypes.SYNC_NEW_ROFS;
    constructor(public rofs: PublicReportOfFireResource[]) { }
}

export class ROFSyncCompleteAction implements Action {
    type = ROFActionTypes.SYNC_NEW_ROFS_COMPLETE;
    constructor() { }
}

export class ROFSyncErrorAction implements Action {
    type = ROFActionTypes.SYNC_NEW_ROFS_ERROR;
    constructor() { }
}

export class ROFLoadAction implements Action {
    type = ROFActionTypes.LOAD_ROF;
    constructor(public wildfireYear: number, public reportOfFireNumber: number, public silent?: boolean) { }
}

export class ROFLoadErrorAction implements Action {
    type = ROFActionTypes.LOAD_ROF_ERROR;
    constructor() { }
}

export class ROFLoadSuccessAction implements Action {
    type = ROFActionTypes.LOAD_ROF_SUCCESS;
    constructor(public response: PublicReportOfFireResource) { }
}

export class ROFLoadCommentsAction implements Action {
    type = ROFActionTypes.LOAD_ROF_COMMENTS;
    constructor(public wildfireYear: number, public reportOfFireNumber: number) { }
}

export class ROFLoadCommentsErrorAction implements Action {
    type = ROFActionTypes.LOAD_ROF_COMMENTS_ERROR;
    constructor() { }
}

export class ROFLoadCommentsSuccessAction implements Action {
    type = ROFActionTypes.LOAD_ROF_COMMENTS_SUCCESS;
    constructor(public wildfireYear: number, public reportOfFireNumber: number, public response: PublicReportOfFireListResource) { }
}

export class UpdateRof {
    type = ROFActionTypes.UPDATE_ROF;
    constructor(public rofId: number, public rof: PublicReportOfFireResource) { }
}
export class UpdateRofSuccess {
    type = ROFActionTypes.UPDATE_ROF_SUCCESS;
    constructor(public rofId: number, public rof: PublicReportOfFireResource) { }
}
export class UpdateRofError {
    type = ROFActionTypes.UPDATE_ROF_ERROR;
    constructor() { }
}

export class RemoveRof {
    type = ROFActionTypes.REMOVE_ROF;
    constructor(public id: string, public rof: PublicReportOfFireResource, public etag: string) { }
}
export class RemoveRofSuccess {
    type = ROFActionTypes.REMOVE_ROF_SUCCESS;
    constructor(public id: string, public rof: PublicReportOfFireResource) { }
}
export class RemoveRofError {
    type = ROFActionTypes.REMOVE_ROF_ERROR;
    constructor(public id: string, public data: { type: string; data: any }) { }
}

export class CreateRof {
    type = ROFActionTypes.CREATE_ROF;
    constructor(public rof: PublicReportOfFireResource) { }
}
export class CreateRofSuccess {
    type = ROFActionTypes.CREATE_ROF_SUCCESS;
    constructor(public rof: PublicReportOfFireResource) { }
}
export class CreateRofError {
    type = ROFActionTypes.CREATE_ROF_ERROR;
    constructor() { }
}

export class NewOpenRof {
    type = ROFActionTypes.OPEN_NEW_ROF;
    constructor() { }
}
export class OpenRof {
    type = ROFActionTypes.OPEN_ROF;
    constructor(public rof: PublicReportOfFireResource) { }
}
export class SetRofStatus {
    type = ROFActionTypes.SET_ROF_STATE;
    constructor(public id: string, public status: null | 'unsaved') { }
}

export class CloseOpenRof {
    type = ROFActionTypes.CLOSE_OPEN_ROF;
    constructor(public id: string) { }
}

export class UpdateRofAudibleAlert {
    type = ROFActionTypes.UPDATE_ROF_AUDIBLE_ALERT;
    componentId = ROF_MAP_COMPONENT_ID;
    constructor(
        public enableUnacknowledged: boolean,
        public enableReceivedFromPM: boolean,
        public selectedZoneIds: string[]
    ) { }
}
export class UpdateRofAudibleAlertSuccess {
    type = ROFActionTypes.UPDATE_ROF_AUDIBLE_ALERT_SUCCESS;
    componentId = ROF_MAP_COMPONENT_ID;
    constructor(
        public enableUnacknowledged: boolean,
        public enableReceivedFromPM: boolean,
        public selectedZoneIds: string[]
    ) { }
}

export class UpdateRofAudibleAlertError {
    type = ROFActionTypes.UPDATE_ROF_AUDIBLE_ALERT_ERROR;
    componentId = ROF_MAP_COMPONENT_ID;
    constructor() { }
}

export type ROFActions = ROFSearchAction |
    ROFSearchSuccessAction |
    ROFSearchErrorAction;
