import {Injectable} from '@angular/core';
import {Action, Store} from '@ngrx/store';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Observable, of} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {CodeHierarchyListService, CodeTableListResource, CodeTableListService} from '@wf1/incidents-rest-api';
import {
  CodeHierarchyListEndpointsService as OrgCodeHierarchyListEndpointsService,
  CodeTableListEndpointsService as OrgCodeTableListEndpointsService,
  CodeTableListResource as OrgCodeTableListResource
} from '@wf1/orgunit-rest-api';
import * as CodeDataActions from './code-data.actions';
import {CodeDataState} from './code-data.state';

@Injectable()
export class CodeDataEffects {
	constructor(
		private actions$: Actions,
		private store: Store<CodeDataState>,
		private codeHierarchyListService: CodeHierarchyListService,
		private codeTableListService: CodeTableListService,
    private orgCodeHierarchyListService: OrgCodeHierarchyListEndpointsService,
		private orgCodeTableListService: OrgCodeTableListEndpointsService
	) {}

	
	getCodeTableData$: Observable<Action> = createEffect(() => this.actions$.pipe(
		ofType(CodeDataActions.CodeDataActionTypes.GET_CODE_TABLE_DATA),
		mergeMap(
			(action) => this.codeTableListService.getCodeTableList().pipe(
				map((response: CodeTableListResource) => new CodeDataActions.GetCodeTableDataSuccessAction(response)),
				catchError(error => of(new CodeDataActions.GetCodeTableDataErrorAction()))
			)
		)
	));

	
	getOrgCodeTableData$: Observable<Action> = createEffect(() => this.actions$.pipe(
		ofType(CodeDataActions.CodeDataActionTypes.GET_ORG_CODE_TABLE_DATA),
		mergeMap(
			(action) => this.orgCodeTableListService.getCodeTableList1().pipe(
				map((response: OrgCodeTableListResource) => new CodeDataActions.GetOrgCodeTableDataSuccessAction(response)),
				catchError(error => of(new CodeDataActions.GetOrgCodeTableDataErrorAction()))
			)
		)
	));

	
	getCodeHierarchyData$: Observable<Action> = createEffect(() => this.actions$.pipe(
		ofType(CodeDataActions.CodeDataActionTypes.GET_CODE_HIERARCHY_DATA),
		mergeMap((action) => {
			return this.codeHierarchyListService.getCodeHierarchyList().pipe(
				map((response: any) => new CodeDataActions.GetCodeHierarchyDataSuccessAction(response)),
				catchError(error => of(new CodeDataActions.GetCodeHierarchyDataErrorAction()))
			);
		})
	));

  
  getOrgCodeHierarchyData$: Observable<Action> = createEffect(() => this.actions$.pipe(
    ofType(CodeDataActions.CodeDataActionTypes.GET_ORG_CODE_HIERARCHY_DATA),
    mergeMap((action) => {
      return this.orgCodeHierarchyListService.getCodeHierarchyList1().pipe(
        map((response: any) => new CodeDataActions.GetOrgCodeHierarchyDataSuccessAction(response)),
        catchError(error => of(new CodeDataActions.GetOrgCodeHierarchyDataErrorAction()))
      );
    })
  ));
}
