import { PublicReportOfFireResource, SimpleReportOfFireResource } from "@wf1/incidents-rest-api";
import { OpenRofs } from "../../models/openRofs.models";
import { SearchStateAndConfig } from "../index";

export const ROF_MAP_COMPONENT_ID = 'searchROFMap';

export interface RofComment {
    ['@type']: string,
    publicReportOfFireCommentGuid: string,
    comment: string,
    systemGeneratedCommentInd: boolean,
    enteredTimestamp: number,
    commenterName: string,
    commenterGuid: string
}

export interface RofComments {
    wildfireYear: number,
    incidentNumberSequence: number;
    comments: RofComment[];
}

export interface RofState {
    rofs: PublicReportOfFireResource[];
    openRofs: OpenRofs[];
    simpleRofs: SimpleReportOfFireResource[];
    newSimpleRofs: SimpleReportOfFireResource[];
    removedRofs: PublicReportOfFireResource[];
    loading: boolean;
    lastSyncDate: number;
    componentId: string;
    activeRof?: SimpleReportOfFireResource;
    activeRofComments?: RofComments;
    unacknowledgedCount: number;
}

export const rofInitialState: RofState = {
    rofs: [],
    openRofs: [],
    simpleRofs: [],
    newSimpleRofs: [],
    removedRofs: [],
    loading: false,
    lastSyncDate: Date.now(),
    componentId: ROF_MAP_COMPONENT_ID,
    unacknowledgedCount: 0
};

export const initialROFSearchState: SearchStateAndConfig = {
    query: null,
    sortParam: 'submittedTimestamp',
    sortDirection: 'DESC',
    sortModalVisible: false,
    filters: {},
    hiddenFilters: {},
    componentId: ROF_MAP_COMPONENT_ID,
    audibleAlert: {
        enableUnacknowledged: false,
        enableReceivedFromPM: false,
        selectedZoneIds: []
    },
    columns: []
};
