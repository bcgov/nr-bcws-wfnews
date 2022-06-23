import * as uuid from 'uuid';
import { SearchActions, SearchState } from '@wf1/core-ui';
import { PublicReportOfFireResource, SimpleReportOfFireResource } from '@wf1/incidents-rest-api';
import {
    CloseOpenRof,
    CreateRofSuccess,
    OpenRof,
    RemoveRofSuccess,
    ROFActionTypes,
    ROFLoadAction,
    ROFLoadCommentsSuccessAction,
    ROFLoadSuccessAction,
    ROFPollingSuccessAction,
    ROFSearchSuccessAction,
    ROFSyncAction,
    SetRofStatus,
    UpdateRofSuccess
} from "./rof.actions";
import { rofInitialState, RofState } from "./rof.state";

export function rofReducer(state: RofState = rofInitialState, action) {
    switch (action.type) {
        case ROFActionTypes.LOAD_ROF:
            let typedAction = (<ROFLoadAction>action);
            let loading = typedAction.silent ? false : true;
            return { ...state, loading: loading };
        case ROFActionTypes.ROF_SEARCH: {
            return { ...state, loading: true };
        }

        case ROFActionTypes.LOAD_ROF_ERROR:
            return { ...state, activeRof: null, loading: false }

        case ROFActionTypes.ROF_SEARCH_ERROR: {
            return { ...state, loading: false };
        }

        case SearchActions.SearchActionTypes.REFRESH_SEARCH:
        case SearchActions.SearchActionTypes.UPDATE_SEARCH_QUERY:
        case SearchActions.SearchActionTypes.UPDATE_SORT:
        case SearchActions.SearchActionTypes.UPDATE_ACTIVE_FILTERS:
        case SearchActions.SearchActionTypes.CLEAR_FILTER:
        case SearchActions.SearchActionTypes.CLEAR_ALL_FILTERS: {
            if (!isMyComponent(state, action.componentId)) {
                return state;
            }
            return { ...state, loading: true };
        }

        case ROFActionTypes.ROF_SEARCH_SUCCESS: {
            const rofs = (<ROFSearchSuccessAction>action).response.collection;
            return {
                ...state,
                rofs,
                lastSyncDate: Date.now(),
                loading: false
            };
        }

        case ROFActionTypes.LOAD_ROF_SUCCESS: {
            const rof = (<ROFLoadSuccessAction>action).response || null;
            return {
                ...state,
                loading: false,
                activeRof: rof,
            };
        }

        case ROFActionTypes.LOAD_ROF_COMMENTS_SUCCESS: {
            const { wildfireYear, reportOfFireNumber, response } = (<ROFLoadCommentsSuccessAction>action);
            if (response) {
                return {
                    ...state,
                    activeRofComments: {
                        wildfireYear,
                        reportOfFireNumber,
                        comments: response.collection
                    }
                }
            } else {
                return state;
            }
        }

        case ROFActionTypes.POLLING_ROF_SUCCESS: {
            let simpleRofs = (<ROFPollingSuccessAction>action).response.collection;
            let rofSearchState = (<ROFPollingSuccessAction>action).searchState as SearchState;
            let filters = rofSearchState ? rofSearchState.filters : undefined;
            let messageStatusCodes = filters && filters.messageStatusCode ? filters.messageStatusCode : undefined;
            let publicReportTypeCodes = filters && filters.publicReportTypeCode ? filters.publicReportTypeCode : undefined;
            let newSimpleRofs = [];
            let newRofs = [...state.rofs];
            let removedRofs = state.removedRofs;
            let rofsChanged = false;

            // console.log("polling rof success - 1", newRofs);
            if (removedRofs && removedRofs.length > 0) {
                removedRofs.forEach((rrof: PublicReportOfFireResource) => {
                    let removedRofIndex = newRofs.findIndex((nrof: PublicReportOfFireResource) => {
                        return nrof.reportOfFireNumber === rrof.reportOfFireNumber && nrof.wildfireYear === rrof.wildfireYear;
                    });

                    if (removedRofIndex !== -1) {
                        newRofs.splice(removedRofIndex, 1);
                    }
                });

                rofsChanged = true;
            }
            if (simpleRofs) {
                // console.log("polling rof success - 2", simpleRofs);
                simpleRofs.forEach((srof: SimpleReportOfFireResource) => {
                    const index = newRofs.findIndex((rof: PublicReportOfFireResource) => {
                        return rof.reportOfFireNumber === srof.reportOfFireNumber && rof.wildfireYear === srof.wildfireYear;
                    });
                    if (index === -1) {
                        // console.log("polling rof success - 3a");
                        if (srof.messageStatusCode === 'Draft') {
                            // console.log("polling rof success - 3b");
                            newSimpleRofs.push(srof);
                        } else {
                            // console.log("polling rof success - 3c");
                            if (!messageStatusCodes || messageStatusCodes.length == 0 || messageStatusCodes.includes(srof.messageStatusCode)) {
                                // console.log("polling rof success - 3d");
                                if (!publicReportTypeCodes || publicReportTypeCodes.length == 0 || publicReportTypeCodes.includes(srof.publicReportTypeCode)) {
                                    // console.log("polling rof success - 3e");
                                    newSimpleRofs.push(srof);
                                }
                            }
                        }
                    } else {
                        // console.log("polling rof success - 3");
                        if (newRofs[index].messageStatusCode !== srof.messageStatusCode) {
                            if (messageStatusCodes && messageStatusCodes.length > 0) {
                                if (!messageStatusCodes.includes(srof.messageStatusCode)) {
                                    newRofs.splice(index, 1);
                                    rofsChanged = true;
                                    return;
                                }
                            }
                            newRofs[index].messageStatusCode = srof.messageStatusCode;
                            rofsChanged = true;
                        }

                        if (newRofs[index].reportOfFireLabel !== srof.reportOfFireLabel) {
                            newRofs[index].reportOfFireLabel = srof.reportOfFireLabel;
                            rofsChanged = true;
                        }
                        if (newRofs[index].incidentLabel !== srof.incidentLabel) {
                            newRofs[index].incidentLabel = srof.incidentLabel;
                            rofsChanged = true;
                        }

                        if (newRofs[index].publicAttachmentCount !== srof.publicAttachmentCount) {
                            newRofs[index].publicAttachmentCount = srof.publicAttachmentCount;
                            rofsChanged = true;
                        }

                        if (newRofs[index].publicReportTypeCode !== srof.publicReportTypeCode) {
                            if (publicReportTypeCodes && !publicReportTypeCodes.includes(srof.publicReportTypeCode)) {
                                newRofs.splice(index, 1);
                                rofsChanged = true;
                                return;
                            }
                            newRofs[index].publicReportTypeCode = srof.publicReportTypeCode;
                            rofsChanged = true;
                        }

                        // console.log("polling rof success - 4");
                        if (newRofs[index].fireLocationPoint !== srof.fireLocationPoint) {
                            // console.log('flp changed');
                            let localFLP = newRofs[index].fireLocationPoint;
                            let serverFLP = srof.fireLocationPoint;
                            if (!localFLP) {
                                newRofs[index].fireLocationPoint = srof.fireLocationPoint;
                                if (serverFLP) {
                                    newRofs[index].longitude = serverFLP['coordinates'][0];
                                    newRofs[index].latitude = serverFLP['coordinates'][1];
                                } else {
                                    newRofs[index].longitude = null;
                                    newRofs[index].latitude = null;
                                }
                                rofsChanged = true;
                            } else {
                                if (!serverFLP) {
                                    newRofs[index].fireLocationPoint = null;
                                    newRofs[index].longitude = null;
                                    newRofs[index].latitude = null;
                                    rofsChanged = true;
                                } else {
                                    if (localFLP['coordinates'] !== serverFLP['coordinates']) {
                                        if ((localFLP['coordinates'][0] !== serverFLP['coordinates'][0])
                                            || (localFLP['coordinates'][1] !== serverFLP['coordinates'][1])) {
                                            newRofs[index].fireLocationPoint = srof.fireLocationPoint;
                                            newRofs[index].longitude = serverFLP['coordinates'][0];
                                            newRofs[index].latitude = serverFLP['coordinates'][1];

                                            rofsChanged = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
            let newState = {
                ...state,
                lastSyncDate: Date.now(),
                removedRofs: [],
                simpleRofs,
                loading: false
            };
            if (rofsChanged) {
                newState.rofs = newRofs;
            }
            if (newSimpleRofs && newSimpleRofs.length > 0) {
                newState.newSimpleRofs = newSimpleRofs;
            }
            // console.log("newState: ", newState);
            return newState;
        }

        case ROFActionTypes.SYNC_NEW_ROFS: {
            const newRofs: PublicReportOfFireResource[] = (<ROFSyncAction>action).rofs;
            const rofs = state.rofs;
            newRofs.forEach((nrof: PublicReportOfFireResource) => {
                const index = rofs.findIndex((rof: PublicReportOfFireResource) => {
                    return rof.reportOfFireNumber === nrof.reportOfFireNumber && rof.wildfireYear === nrof.wildfireYear;
                });
                if (index === -1) {
                    rofs.unshift(nrof);
                } else {
                    rofs[index] = nrof
                }
            });

            return { ...state, rofs: [...rofs], newSimpleRofs: [] };
        }

        case ROFActionTypes.UPDATE_ROF_SUCCESS: {
            const indexes = getRofIndexes((<UpdateRofSuccess>action).rofId, null, state);
            const ns = { ...state };
            if (indexes.rofIndex !== -1) {
                ns.rofs[indexes.rofIndex] = (<UpdateRofSuccess>action).rof;
            }
            if (indexes.openRofIndex !== -1) {
                ns.openRofs[indexes.openRofIndex] = {
                    id: ns.openRofs[indexes.openRofIndex].id,
                    rof: (<UpdateRofSuccess>action).rof,
                    state: 'saved'
                };
            }
            return state;
        }

        case ROFActionTypes.REMOVE_ROF_SUCCESS: {
            let removedRof = (<RemoveRofSuccess>action).rof;
            const ns = { ...state, removedRofs: [...state.removedRofs, removedRof] };
            return ns;
        }

        case ROFActionTypes.CREATE_ROF_SUCCESS: {
            return {
                ...state,
                rofs: [...state.rofs].push((<CreateRofSuccess>action).rof)
            };
        }

        case ROFActionTypes.OPEN_NEW_ROF: {
            return { ...state, openRofs: [...state.openRofs, { state: '', id: uuid.v4(), rof: {} }] };
        }

        case ROFActionTypes.OPEN_ROF: {
            if ((<OpenRof>action).rof) {
                return state;
            }
            const indexes = getRofIndexes(null, (<OpenRof>action).rof.reportOfFireNumber, state);
            if (indexes.openRofIndex === -1) {
                return { ...state, openRofs: [...state.openRofs, { state: null, id: uuid.v4(), rof: (<OpenRof>action).rof }] };
            } else {
                return state;
            }

        }
        case ROFActionTypes.SET_ROF_STATE: {
            const indexes = getRofIndexes(null, (<SetRofStatus>action).id, state);
            if (indexes.openRofIndex !== -1) {
                const newOpenRofs = [...state.openRofs];
                newOpenRofs[indexes.openRofIndex] = { ...newOpenRofs[indexes.openRofIndex], state: (<SetRofStatus>action).status };
                return { ...state, openRofs: [...newOpenRofs] };
            } else {
                return state;
            }
        }
        case ROFActionTypes.CLOSE_OPEN_ROF: {
            const indexes = getRofIndexes(null, (<CloseOpenRof>action).id, state);
            const ns = { ...state };
            if (indexes.openRofIndex !== -1) {
                ns.openRofs.splice(indexes.openRofIndex, 1);
            }
            return ns;
        }

        default:
            return state;
    }
}

function getRofIndexes(rofId, openRofId, state) {
    const rofIndex = state.rofs.findIndex((rof: PublicReportOfFireResource) => {
        return `${rof.reportOfFireNumber}` === rofId;
    });
    const openRofIndex = state.openRofs.findIndex(open => {
        if (openRofId) {
            return `${open.id}` === openRofId;
        } else {
            return (open.rof && open.rof.reportOfFireNumber && open.rof.reportOfFireNumber === rofId);
        }
    });
    return { rofIndex: rofIndex, openRofIndex: openRofIndex };
}

const isMyComponent = (state: any, componentId: string): boolean => {
    if (state && state.componentId && componentId) {
        if (state.componentId === componentId) {
            return true;
        }
    }
    return false;
};
