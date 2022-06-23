import {ProvisionalZoneResource, PublicReportOfFireResource, SimpleReportOfFireResource} from "@wf1/incidents-rest-api";
import {SearchState} from "@wf1/core-ui";

export const NROF_MAP_COMPONENT_ID = 'searchNROFMap';

export interface NrofComment {
  ['@type']: string,
  publicReportOfFireCommentGuid: string,
  comment: string,
  systemGeneratedCommentInd: boolean,
  enteredTimestamp: number,
  commenterName: string,
  commenterGuid: string
}

export interface NrofComments {
  wildfireYear: number,
  incidentNumberSequence: number;
  comments: NrofComment[];
}

export interface NrofState {
  nrofs: ProvisionalZoneResource[];
  simpleNrofs: ProvisionalZoneResource[];
  newSimpleNrofs: ProvisionalZoneResource[];
  removedNrofs: ProvisionalZoneResource[];
  loading: boolean;
  lastSyncDate: number;
  componentId: string;
  activeNrofId?: string;
  activeNrofComments?: NrofComments;
}

export const nrofInitialState: NrofState = {
  nrofs: [],
  simpleNrofs: [],
  newSimpleNrofs: [],
  removedNrofs: [],
  loading: false,
  lastSyncDate: Date.now(),
  componentId: NROF_MAP_COMPONENT_ID
};

export const initialNROFSearchState: SearchState = {
  query: null,
  sortParam: 'effectiveTimeStamp',
  sortDirection: 'DESC',
  sortModalVisible: false,
  filters: { },
  hiddenFilters: {},
  componentId: NROF_MAP_COMPONENT_ID
};
