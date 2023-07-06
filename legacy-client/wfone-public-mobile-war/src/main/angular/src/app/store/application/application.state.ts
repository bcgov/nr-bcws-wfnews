import {NearMeItem} from "../../services/point-id.service";

export enum ERROR_TYPE {
    VALIDATION,
    WARNING,
    FATAL,
    NOT_FOUND,
    FAILED_PRECONDITION
}

export interface ValidationError {
    path: string,
    message: string,
    messageTemplate: string,
    messageArguments: any[],
}

export interface Option {
    code: string;
    description: string;
}

export interface LoadStates {

}

export interface LoadState {
    isLoading: boolean;
}

export interface ErrorState {
    uuid: string;
    type: ERROR_TYPE;
    status: number;
    statusText?: string;
    message?: string;
    name: string;
    validationErrors?: ValidationError[];
    responseEtag: string;
}

export function isErrorState(errorState:any) {

    const result = errorState.uuid !== undefined && errorState.type !== undefined && errorState.status !== undefined
        && errorState.statusText !== undefined  && errorState.name !== undefined && errorState.responseEtag !== undefined;

    return result;
}

export interface ErrorStates {

}
export interface LandingState {
    currentNearMeHighlight: NearMeItem;
    currentBackRoute: string;
}

export interface ApplicationState {
    loadStates: LoadStates;
    errorStates: ErrorStates;
    landingState:LandingState;
}

export function getDefaultLoadStates(): LoadStates {
    return {

    }
}

export function getDefaultErrorStates(): ErrorStates {
    return {

    }
}

export function getDefaultLandingState(): LandingState {
    return {
        currentNearMeHighlight: undefined,
        currentBackRoute: undefined,
    }
}


export function getDefaultApplicationState(): ApplicationState {
    return {
        loadStates: getDefaultLoadStates(),
        errorStates: getDefaultErrorStates(),
        landingState: getDefaultLandingState(),
    };
}
