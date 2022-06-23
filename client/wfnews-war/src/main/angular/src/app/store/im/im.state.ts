import {
  PublicReportOfFireResource,
  SimpleWildfireIncidentResource,
  WildfireIncidentResource
} from "@wf1/incidents-rest-api";
import {OpenIncident} from "../../modules/im-external/models";
import {SearchStateAndConfig} from "../index";
import {WFError} from "../../modules/core/models/wf-error";

export const INCIDENT_COMPONENT_ID = 'searchIM';
export const INCIDENT_MAP_COMPONENT_ID = 'searchIMMap';

export interface IncidentComment{
  incidentCommentGuid?: string;
  comment?: string;
  systemGeneratedCommentInd?: boolean;
  enteredTimestamp?: Date;
  commenterName?: string;
  commenterGuid?: string;
}

export interface IncidentComments {
  wildfireYear: string,
  incidentNumberSequence: string;
  comments: IncidentComment[];
}

export interface IMState {
  simpleIncidents: SimpleWildfireIncidentResource[];
  incidents: WildfireIncidentResource[];
  openIncidents: OpenIncident[];
  loading: boolean;
  error: WFError[];
  componentId: string;
  activeIncidentId?: string;
  activeIncident?: WildfireIncidentResource;
  activeIncidentComments?: IncidentComments;
  activeIncidentRofs?: PublicReportOfFireResource[];
  editingRsrc?: WildfireIncidentResource,
  editingRsrcEtag?: string,
  simpleIncidentsPolling: SimpleWildfireIncidentResource[];
  newSimpleIncidents: SimpleWildfireIncidentResource[];
  removedIncidents: WildfireIncidentResource[];
  lastSyncDate: number;
}

export const initialIMState: IMState = {
  incidents: [],
  simpleIncidents: [],
  openIncidents: [],
  loading: false,
  error: [],
  componentId: INCIDENT_COMPONENT_ID,
  editingRsrc: null,
  editingRsrcEtag: null,
  simpleIncidentsPolling: [],
  newSimpleIncidents: [],
  removedIncidents: [],
  lastSyncDate: Date.now()
};

export const initialIMSearchState: SearchStateAndConfig = {
  query: null,
  sortParam: 'discoveryDate',
  sortDirection: 'DESC',
  sortModalVisible: false,
  filters: {},
  hiddenFilters: { incidentCategoryCode: ['FIRE_RESP'] },
  componentId: INCIDENT_COMPONENT_ID,
  columns:[]
};

export const isMyComponent = (state: any, componentId: string): boolean =>  {
  return (state && state.componentId && state.componentId === componentId);
};
