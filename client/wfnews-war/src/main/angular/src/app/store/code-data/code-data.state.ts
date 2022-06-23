import {CodeTablesIndex} from "@wf1/core-ui";
import {CodeTableResource} from "@wf1/incidents-rest-api";
import {CodeTableResource as OrgCodeTableResource} from "@wf1/orgunit-rest-api";

export interface CodeDataState {
  codeIndex: CodeTablesIndex;
  codeTables: CodeTableResource[];
  orgCodeIndex: CodeTablesIndex;
  orgCodeTables: OrgCodeTableResource[];
  codeHierarchyIndex: CodeTablesIndex;
  codeHierarchyTables: CodeTableResource[]
  orgCodeHierarchyIndex: CodeTablesIndex;
  orgCodeHierarchyTables: OrgCodeTableResource[]

  loading: boolean;
  error: string;
}

export const initialCodeDataState: CodeDataState = {
  codeIndex: {},
  codeTables: [],
  orgCodeIndex: {},
  orgCodeTables: [],
  codeHierarchyIndex: {},
  codeHierarchyTables: [],
  orgCodeHierarchyIndex: {},
  orgCodeHierarchyTables: [],
  loading: false,
  error: null
};

export interface CodeData {
  code: string;
  description: string;
  displayOrder: number;
  effectiveDate: string;
  expiryDate: string;
}

export interface Option {
  code: string;
  description: string;
}
