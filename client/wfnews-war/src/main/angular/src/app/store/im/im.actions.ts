import {HttpErrorResponse} from "@angular/common/http";
import {Action} from '@ngrx/store';
// Models
import {
  IncidentCauseResource,
  IncidentCommentListResource,
  PublicReportOfFireResource,
  SimpleWildfireIncidentListResource,
  WildfireIncidentListResource,
  WildfireIncidentResource
} from '@wf1/incidents-rest-api';
import {INCIDENT_COMPONENT_ID, IncidentComment} from "./im.state";
import {EventEmitter} from "@angular/core";

export enum IncidentActionTypes {

	OPEN_INCIDENT_TABLE = '[ Incident ] Open incident table',

	OPEN_INCIDENT_TAB = '[ Incident ] Open incident tab',
  OPEN_NEW_INCIDENT_TAB = '[ Incident ] Open new incident tab',
  OPEN_INCIDENT_TAB_SUCCESS = '[ Incident ] Open incident tab success',
  OPEN_INCIDENT_TAB_ERROR = '[ Incident ] Open incident tab error',
  CLOSE_INCIDENT_TAB  = '[ Incident ] Close incident tab',

  FOCUS_OPEN_INCIDENT = '[ Incident ] Set active incident number',

  INCIDENT_SEARCH = '[ Incident ] Search incident',
  INCIDENT_SEARCH_SUCCESS = '[ Incident ] Search incident success',
  INCIDENT_SEARCH_ERROR = '[ Incident ] Search incident error',
  INCIDENT_SEARCH_IGNORE = '[ Incident ] Search incident ignore action', // Fired when target component doesn't match

  INCIDENT_SIMPLE_SEARCH = '[ Incident ] Search simple incident',
  INCIDENT_SIMPLE_SEARCH_SUCCESS = '[ Incident ] Search simple incident success',
  INCIDENT_SIMPLE_SEARCH_ERROR = '[ Incident ] Search simple incident error',
  INCIDENT_SIMPLE_SEARCH_IGNORE = '[ Incident ] Search simple incident ignore action', // Fired when target component doesn't match

  INCIDENT_LOAD = '[ Incident ] Load incident',
  INCIDENT_LOAD_SUCCESS = '[ Incident ] Load incident success',
  INCIDENT_LOAD_ERROR = '[ Incident ] Load incident error',

	UPDATE_INCIDENT = '[ Incident ] Update incident',
	UPDATE_INCIDENT_SUCCESS = '[ Incident ] Update incident success',
	UPDATE_INCIDENT_ERROR = '[ Incident ] Update incident error',

	SIGN_OFF_INCIDENT = '[ Incident ] Sign off incident',
	APPROVE_INCIDENT = '[ Incident ] Approve incident',
	UNSIGN_INCIDENT = '[ Incident ] Unsign incident',
	UNAPPROVE_INCIDENT = '[ Incident ] Unapprove incident',

  OPEN_INCIDENT_CAUSE_CODE = '[ Incident ] Open incident cause code',
  OPEN_INCIDENT_CAUSE_CODE_SUCCESS = '[ Incident ] Open incident cause code success',
  OPEN_INCIDENT_CAUSE_CODE_ERROR = '[ Incident ] Open incident cause code error',

  LOAD_INCIDENT_COMMENT = '[ Incident ] Load incident comment',
  LOAD_INCIDENT_COMMENT_SUCCESS = '[ Incident ] Load incident comment success',
  LOAD_INCIDENT_COMMENT_ERROR = '[ Incident ] Load incident comment error',

  LOAD_INCIDENTrofs = '[ Incident ] Load incident rofs',
  LOAD_INCIDENTrofs_SUCCESS = '[ Incident ] Load incident rofs success',
  LOAD_INCIDENTrofs_ERROR = '[ Incident ] Load incident rofs error',

  SAVE_COMMENT = 'SAVE_COMMENT',
  SAVE_COMMENT_SUCCESS = 'SAVE_COMMENT_SUCCESS',
	SAVE_COMMENT_ERROR = 'SAVE_COMMENT_ERROR',

  SELECT_INCIDENT_FOR_EDITING = 'SELECT_INCIDENT_FOR_EDITING',
  SELECT_INCIDENT_FOR_EDITING_SUCCESS = 'SELECT_INCIDENT_FOR_EDITING_SUCCESS',
  SELECT_INCIDENT_FOR_EDITING_ERROR = 'SELECT_INCIDENT_FOR_EDITING_ERROR',

  UNSELECT_INCIDENT_FOR_EDITING = 'UNSELECT_INCIDENT_FOR_EDITING',
  UNSELECT_INCIDENT_FOR_EDITING_SUCCESS = 'UNSELECT_INCIDENT_FOR_EDITING_SUCCESS',

  POLLING_INCIDENT = '[ Incident ] polling',
  POLLING_INCIDENT_SUCCESS = '[ Incident ] polling success',
  POLLING_INCIDENT_ERROR = '[ Incident ] error polling',
  POLLING_INCIDENT_IGNORE = '[ Incident ] polling ignore action', // Fired when the incident state is not properly initialized.

  SYNC_NEW_INCIDENTS = '[ Incident ] syncing new incidents',
  SYNC_NEW_INCIDENTS_COMPLETE = '[ Incident ] syncing incidents complete',
  SYNC_NEW_INCIDENTS_ERROR = '[ Incident ] syncing incidents complete',

}

export interface SaveCommentAction extends Action {
  payload: {
    wildfireYear: number;
    incidentNumberSequence: number;
    value: IncidentComment;
  }
}

export interface SaveCommentSuccessAction extends Action {
  payload: {
    value: IncidentComment;
  }
}

export interface SaveCommentErrorAction extends Action {
  payload: {
    error: Error;
  }
}

export function saveComment(wildfireYear: number, incidentNumberSequence: number, value: IncidentComment): SaveCommentAction {
  return {
    type: IncidentActionTypes.SAVE_COMMENT,
    payload: {
      wildfireYear,
			incidentNumberSequence,
      value
    }
  };
}

export function saveCommentSuccess(value: IncidentComment): SaveCommentSuccessAction {
  return {
    type: IncidentActionTypes.SAVE_COMMENT_SUCCESS,
    payload: {
      value
    }
  };
}

export function saveCommentError(error: Error): SaveCommentErrorAction {
  return {
    type: IncidentActionTypes.SAVE_COMMENT_ERROR,
    payload: {
      error
    }
  };
}

export class IncidentSearchAction implements Action {
	type = IncidentActionTypes.INCIDENT_SEARCH;
	constructor(public componentId) {}
}

export class IncidentSearchSuccessAction implements Action {
	type = IncidentActionTypes.INCIDENT_SEARCH_SUCCESS;
	constructor(public response: WildfireIncidentListResource, public componentId) {}
}

export class IncidentSearchErrorAction implements Action {
	type = IncidentActionTypes.INCIDENT_SEARCH_ERROR;
	constructor() {}
}

export class IncidentSearchIgnoreAction implements Action {
	type = IncidentActionTypes.INCIDENT_SEARCH_IGNORE;
	constructor() {}
}

export class IncidentSimpleSearchAction implements Action {
  type = IncidentActionTypes.INCIDENT_SIMPLE_SEARCH;
  constructor(public componentId) {}
}

export class IncidentSimpleSearchSuccessAction implements Action {
  type = IncidentActionTypes.INCIDENT_SIMPLE_SEARCH_SUCCESS;
  constructor(public response: SimpleWildfireIncidentListResource, public componentId) {}
}

export class IncidentSimpleSearchErrorAction implements Action {
  type = IncidentActionTypes.INCIDENT_SIMPLE_SEARCH_ERROR;
  constructor() {}
}

export class IncidentSimpleSearchIgnoreAction implements Action {
  type = IncidentActionTypes.INCIDENT_SIMPLE_SEARCH_IGNORE;
  constructor() {}
}

export class IncidentLoadAction implements Action {
	type = IncidentActionTypes.INCIDENT_LOAD;
	constructor(public wildfireYear: number, public incidentNumberSequence: number) {}
}

export class IncidentLoadSuccessAction implements Action {
	type = IncidentActionTypes.INCIDENT_LOAD_SUCCESS;
	constructor(public response: WildfireIncidentResource) {}
}

export class IncidentLoadErrorAction implements Action {
	type = IncidentActionTypes.INCIDENT_LOAD_ERROR;
	constructor() {}
}

export class OpenIncidentTableAction implements Action {
	type = IncidentActionTypes.OPEN_INCIDENT_TABLE;
	constructor() {}
}

export class OpenIncidentTabAction implements Action {
	type = IncidentActionTypes.OPEN_INCIDENT_TAB;
	constructor(public incident: WildfireIncidentResource | { wildfireYear: string, incidentNumberSequence: string }) {}
}

export class OpenIncidentTabSuccessAction implements Action {
	type = IncidentActionTypes.OPEN_INCIDENT_TAB_SUCCESS;
  componentId = INCIDENT_COMPONENT_ID;
	constructor(public etag: string, public incident: WildfireIncidentResource) {}
}

export class OpenIncidentTabErrorAction implements Action {
	type = IncidentActionTypes.OPEN_INCIDENT_TAB_ERROR;
	constructor() {}
}

export class OpenNewIncidentTabAction implements Action {
	type = IncidentActionTypes.OPEN_NEW_INCIDENT_TAB;
	constructor() {}
}

export class CloseIncidentTabAction implements Action {
	type = IncidentActionTypes.CLOSE_INCIDENT_TAB;
  componentId = INCIDENT_COMPONENT_ID;
	constructor(public id: string) {}
}

export class UpdateIncidentAction implements Action {
	type = IncidentActionTypes.UPDATE_INCIDENT;
  componentId = INCIDENT_COMPONENT_ID;
  constructor(public etag: string, public incident: WildfireIncidentResource) {}
}

export class UpdateIncidentSuccessAction implements Action {
	type = IncidentActionTypes.UPDATE_INCIDENT_SUCCESS;
  componentId = INCIDENT_COMPONENT_ID;
	constructor(public etag: string, public incident: WildfireIncidentResource) {}
}

export class UpdateIncidentErrorAction implements Action {
	type = IncidentActionTypes.UPDATE_INCIDENT_ERROR;
  componentId = INCIDENT_COMPONENT_ID;
	constructor(public error: HttpErrorResponse) {}
}

export class SignOffIncidentAction implements Action {
	type = IncidentActionTypes.SIGN_OFF_INCIDENT;
	constructor(public wildfireYear: number, public incidentNumberSequence: number) {}
}

export class ApproveIncidentAction implements Action {
	type = IncidentActionTypes.APPROVE_INCIDENT;
	constructor(public wildfireYear: number, public incidentNumberSequence: number) {}
}

export class UnsignIncidentAction implements Action {
  type = IncidentActionTypes.UNSIGN_INCIDENT;
  constructor(public wildfireYear: number, public incidentNumberSequence: number) {}
}

export class UnapproveIncidentAction implements Action {
  type = IncidentActionTypes.UNAPPROVE_INCIDENT;
  constructor(public wildfireYear: number, public incidentNumberSequence: number) {}
}

export class OpenIncidentCauseCodeAction implements Action {
  type = IncidentActionTypes.OPEN_INCIDENT_CAUSE_CODE;
  constructor(public incidentId: string, public refreshCauseEmitter?: EventEmitter<IncidentCauseResource>) {}
}

export class OpenIncidentCauseCodeSuccessAction implements Action {
  type = IncidentActionTypes.OPEN_INCIDENT_CAUSE_CODE_SUCCESS;
  constructor() {}
}

export class OpenIncidentCauseCodeErrorAction implements Action {
  type = IncidentActionTypes.OPEN_INCIDENT_CAUSE_CODE_ERROR;
  constructor(public errorMessage: string, public errorDetail: string) {}
}

export class FocusOpenIncident {
  	type = IncidentActionTypes.FOCUS_OPEN_INCIDENT;
  	constructor( public id: string ) {}
}

export class IncidentCommentLoadAction implements Action {
  type = IncidentActionTypes.LOAD_INCIDENT_COMMENT;
  constructor(public wildfireYear: string, public incidentNumberSequence: string) {}
}

export class IncidentCommentLoadSuccessAction implements Action {
  type = IncidentActionTypes.LOAD_INCIDENT_COMMENT_SUCCESS;
  constructor(public wildfireYear: string, public incidentNumberSequence: string, public response: IncidentCommentListResource) {}
}

export class IncidentCommentLoadErrorAction implements Action {
  type = IncidentActionTypes.LOAD_INCIDENT_COMMENT_ERROR;
  constructor() {}
}

export class IncidentRofsLoadAction implements Action {
  type = IncidentActionTypes.LOAD_INCIDENTrofs;
  constructor(public wildfireYear: string, public incidentNumberSequence: string) {}
}

export class IncidentRofsLoadSuccessAction implements Action {
  type = IncidentActionTypes.LOAD_INCIDENTrofs_SUCCESS;
  constructor(public wildfireYear: string, public incidentNumberSequence: string, public response: PublicReportOfFireResource[]) {}
}

export class IncidentRofsLoadErrorAction implements Action {
  type = IncidentActionTypes.LOAD_INCIDENTrofs_ERROR;
  constructor() {}
}


export interface SelectIncidentForEditingAction extends Action {
  payload: {
    resource: WildfireIncidentResource;
  }
}

export interface SelectIncidentForEditingSuccessAction extends Action {
  payload: {
    resource: WildfireIncidentResource;
    etag:string;
  }
}

export interface SelectIncidentForEditingErrorAction extends Action {
  payload: {
    error: Error;
  }
}


export function selectIncidentForEditing(resource:WildfireIncidentResource): SelectIncidentForEditingAction {
  return {
    type: IncidentActionTypes.SELECT_INCIDENT_FOR_EDITING,
    payload: {
      resource: resource,
    }
  };
}

export function selectIncidentForEditingSuccess(etag:string, resource: WildfireIncidentResource): SelectIncidentForEditingSuccessAction {
  return {
    type: IncidentActionTypes.SELECT_INCIDENT_FOR_EDITING_SUCCESS,
    payload: {
      resource: resource,
      etag: etag
    }
  };
}

export function selectIncidentForEditingError(error: Error): SelectIncidentForEditingErrorAction {
  return {
    type: IncidentActionTypes.SELECT_INCIDENT_FOR_EDITING_ERROR,
    payload: {
      error
    }
  };
}



export interface UnselectIncidentForEditingAction extends Action {
  payload: {

  }
}

export interface UnselectIncidentForEditingSuccessAction extends Action {
  payload: {
  }
}



export function unselectIncidentForEditing(): UnselectIncidentForEditingAction {
  return {
    type: IncidentActionTypes.UNSELECT_INCIDENT_FOR_EDITING,
    payload: {

    }
  };
}

export function unselectIncidentForEditingSuccess(): UnselectIncidentForEditingSuccessAction {
  return {
    type: IncidentActionTypes.SELECT_INCIDENT_FOR_EDITING_SUCCESS,
    payload: {
    }
  };
}

export class IncidentPollingAction implements Action {
  type = IncidentActionTypes.POLLING_INCIDENT;
  constructor() {}
}

export class IncidentPollingSuccessAction implements Action {
  type = IncidentActionTypes.POLLING_INCIDENT_SUCCESS;
  constructor(public response: SimpleWildfireIncidentListResource, public searchState : any) {}
}

export class IncidentPollingErrorAction implements Action {
  type = IncidentActionTypes.POLLING_INCIDENT_ERROR;
  constructor() {}
}

export class IncidentPollingIgnoreAction implements Action {
  type = IncidentActionTypes.POLLING_INCIDENT_IGNORE;
  constructor() {}
}

export class IncidentSyncAction implements Action {
  type = IncidentActionTypes.SYNC_NEW_INCIDENTS;
  constructor( public rofs: PublicReportOfFireResource[]) {}
}

export class IncidentSyncCompleteAction implements Action {
  type = IncidentActionTypes.SYNC_NEW_INCIDENTS_COMPLETE;
  constructor() {}
}

export class IncidentSyncErrorAction implements Action {
  type = IncidentActionTypes.SYNC_NEW_INCIDENTS_ERROR;
  constructor() {}
}


export type IncidentActions =
  IncidentSearchAction |
  IncidentSearchSuccessAction |
  IncidentSearchErrorAction |
  IncidentSearchIgnoreAction |
  IncidentLoadAction |
  IncidentLoadSuccessAction |
  IncidentLoadErrorAction |
  OpenIncidentTableAction |
  OpenIncidentTabAction |
  OpenIncidentTabSuccessAction |
  OpenIncidentTabErrorAction |
  OpenNewIncidentTabAction |
  CloseIncidentTabAction |
  UpdateIncidentAction |
  UpdateIncidentSuccessAction |
  SignOffIncidentAction |
  ApproveIncidentAction |
  SelectIncidentForEditingAction |
  SelectIncidentForEditingSuccessAction |
  SelectIncidentForEditingErrorAction |
  UnselectIncidentForEditingAction |
  UnselectIncidentForEditingSuccessAction |
  IncidentPollingAction |
  IncidentPollingSuccessAction |
  IncidentPollingErrorAction |
  IncidentPollingIgnoreAction |
  IncidentSyncAction |
  IncidentSyncCompleteAction |
  IncidentSyncErrorAction
  ;
