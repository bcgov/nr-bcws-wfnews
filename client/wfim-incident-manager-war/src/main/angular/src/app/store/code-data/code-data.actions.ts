import {Action} from '@ngrx/store';
// Models
import {CodeTableListResource} from '@wf1/incidents-rest-api';
import {CodeTableListResource as OrgCodeTableListResource} from '@wf1/orgunit-rest-api';

export enum CodeDataActionTypes {
	GET_CODE_TABLE_DATA = '[ Code ] Get code table data',
	GET_CODE_TABLE_DATA_SUCCESS = '[ Code ] Got code table data successfully',
	GET_CODE_TABLE_DATA_ERROR = '[ Code ] Error getting code table data',

	GET_ORG_CODE_TABLE_DATA = '[ Code ] Get org unit code table data',
	GET_ORG_CODE_TABLE_DATA_SUCCESS = '[ Code ] Got org unit code table data successfully',
	GET_ORG_CODE_TABLE_DATA_ERROR = '[ Code ] Error getting org unit code table data',

	GET_CODE_HIERARCHY_DATA = '[ Code ] Get code hierarchy data',
	GET_CODE_HIERARCHY_DATA_SUCCESS = '[ Code ] Got code hierarchy data successfully',
	GET_CODE_HIERARCHY_DATA_ERROR = '[ Code ] Error getting code hierachy data',

  GET_ORG_CODE_HIERARCHY_DATA = '[ Code ] Get org code hierarchy data',
  GET_ORG_CODE_HIERARCHY_DATA_SUCCESS = '[ Code ] Got org code hierarchy data successfully',
  GET_ORG_CODE_HIERARCHY_DATA_ERROR = '[ Code ] Error getting org code hierachy data',
};

export class GetCodeTableDataAction implements Action {
	type = CodeDataActionTypes.GET_CODE_TABLE_DATA;
	constructor() {}
}

export class GetCodeTableDataSuccessAction implements Action {
	type = CodeDataActionTypes.GET_CODE_TABLE_DATA_SUCCESS;
	constructor(public response: CodeTableListResource) {}
}

export class GetCodeTableDataErrorAction implements Action {
	type = CodeDataActionTypes.GET_CODE_TABLE_DATA_ERROR;
	constructor() {}
}

export class GetOrgCodeTableDataAction implements Action {
	type = CodeDataActionTypes.GET_ORG_CODE_TABLE_DATA;
	constructor() {}
}

export class GetOrgCodeTableDataSuccessAction implements Action {
	type = CodeDataActionTypes.GET_ORG_CODE_TABLE_DATA_SUCCESS;
	constructor(public response: OrgCodeTableListResource) {}
}

export class GetOrgCodeTableDataErrorAction implements Action {
	type = CodeDataActionTypes.GET_ORG_CODE_TABLE_DATA_ERROR;
	constructor() {}
}

export class GetCodeHierarchyDataAction implements Action {
	type = CodeDataActionTypes.GET_CODE_HIERARCHY_DATA;
	constructor() {}
}

export class GetCodeHierarchyDataSuccessAction implements Action {
	type = CodeDataActionTypes.GET_CODE_HIERARCHY_DATA_SUCCESS;
	constructor(public response: any) {}
}

export class GetCodeHierarchyDataErrorAction implements Action {
	type = CodeDataActionTypes.GET_CODE_HIERARCHY_DATA_ERROR;
	constructor() {}
}

export class GetOrgCodeHierarchyDataAction implements Action {
  type = CodeDataActionTypes.GET_ORG_CODE_HIERARCHY_DATA;
  constructor() {}
}

export class GetOrgCodeHierarchyDataSuccessAction implements Action {
  type = CodeDataActionTypes.GET_ORG_CODE_HIERARCHY_DATA_SUCCESS;
  constructor(public response: any) {}
}

export class GetOrgCodeHierarchyDataErrorAction implements Action {
  type = CodeDataActionTypes.GET_ORG_CODE_HIERARCHY_DATA_ERROR;
  constructor() {}
}

export type CodeDataActions = 	GetCodeTableDataAction |
								GetCodeTableDataSuccessAction |
								GetCodeTableDataErrorAction |
								GetOrgCodeTableDataAction |
								GetOrgCodeTableDataSuccessAction |
								GetOrgCodeTableDataErrorAction |
								GetCodeHierarchyDataAction |
								GetCodeHierarchyDataSuccessAction |
                                GetCodeHierarchyDataErrorAction;
