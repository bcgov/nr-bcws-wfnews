import {Code, CodeHierarchyResource, CodeTableResource, Hierarchy} from '@wf1/incidents-rest-api';
import {
  Code as OrgCode,
  CodeHierarchyResource as OrgCodeHierarchyResource,
  CodeTableResource as OrgCodeTableResource
} from '@wf1/orgunit-rest-api';

import * as CodeData from './code-data.actions';
import {CodeDataState, initialCodeDataState} from "./code-data.state";

export function codeDataReducer(state: CodeDataState = initialCodeDataState, action: CodeData.CodeDataActions): CodeDataState {
	switch(action.type) {
		case CodeData.CodeDataActionTypes.GET_CODE_TABLE_DATA:
		case CodeData.CodeDataActionTypes.GET_ORG_CODE_TABLE_DATA: {
			return Object.assign({}, state, { loading: true });
		}

		case CodeData.CodeDataActionTypes.GET_CODE_TABLE_DATA_SUCCESS: {
			const codeTables = (<CodeData.GetCodeTableDataSuccessAction>action).response.codeTableList || [];
			const formattedCodeTables = formatCodeTables(codeTables);
			return Object.assign({}, state, { loading: false, codeIndex: formattedCodeTables, codeTables: codeTables });
		}

		case CodeData.CodeDataActionTypes.GET_ORG_CODE_TABLE_DATA_SUCCESS: {
			const codeTables = (<CodeData.GetOrgCodeTableDataSuccessAction>action).response.codeTableList || [];
			const formattedCodeTables = formatCodeTables(codeTables);
			return Object.assign({}, state, { loading: false, orgCodeIndex: formattedCodeTables, orgCodeTables: codeTables });
		}

    case CodeData.CodeDataActionTypes.GET_CODE_HIERARCHY_DATA_SUCCESS: {
      const codeTableHierarchies = (<CodeData.GetCodeHierarchyDataSuccessAction>action).response.codeHierarchyList || [];
      const formattedCodeHierarchies = formatCodeHierarchies(codeTableHierarchies);
      return Object.assign({}, state, { loading: false, codeHierarchyIndex: formattedCodeHierarchies, codeHierarchyTables: codeTableHierarchies });
    }

    case CodeData.CodeDataActionTypes.GET_ORG_CODE_HIERARCHY_DATA_SUCCESS: {
      const codeTableHierarchies = (<CodeData.GetCodeHierarchyDataSuccessAction>action).response.codeHierarchyList || [];
      const formattedCodeHierarchies = formatCodeHierarchies(codeTableHierarchies);
      return Object.assign({}, state, { loading: false, orgCodeHierarchyIndex: formattedCodeHierarchies, orgCodeHierarchyTables: codeTableHierarchies });
    }

		case CodeData.CodeDataActionTypes.GET_CODE_TABLE_DATA_ERROR:
		case CodeData.CodeDataActionTypes.GET_ORG_CODE_TABLE_DATA_ERROR: {
			console.error('Error retrieving code table data');
			return Object.assign({}, state, { loading: false });
		}

		default: {
			return state;
		}
	}
}
export const formatCodeHierarchies = ( codeHierarchies: CodeHierarchyResource[] | OrgCodeHierarchyResource[]) => {
  return codeHierarchies.reduce(
    (acc, table: CodeHierarchyResource | OrgCodeHierarchyResource) => {
      acc[table.codeHierarchyName] = table.hierarchy.reduce((acc2, code: Hierarchy) => {
        if(acc2[code.upperCode] && acc2[code.upperCode].length > 0 ){
          acc2[code.upperCode].push(code.lowerCode);
        }else{
          acc2[code.upperCode] = [];
          acc2[code.upperCode].push(code.lowerCode);
        }
        return acc2;
      }, {});
      return acc;
    }, {}
  );
}

export const formatCodeTables = (codeTables: CodeTableResource[] | OrgCodeTableResource[]) => {
	return codeTables.reduce(
		(acc, table: CodeTableResource | OrgCodeTableResource) => {
			acc[table.codeTableName] = table.codes.reduce((accc, code: Code | OrgCode) => {
				accc[code.code] = code.description;
				return accc;
			}, {});
			return acc;
		}, {}
	);
};
