import { SimpleWildfireIncidentResource, WildfireIncidentResource } from "@wf1/incidents-rest-api";
import { ErrorMessages } from "../config/error-messages";
import { mapPathToComponents } from "../config/validation-path-mapping";
import {
    APIValidationError,
    ERROR_TYPE,
    FormValidationState,
    ValidationErrorState
} from "../store/validation/validation.state";


export function convertSignOffVerificationToIMFormValidation(validationErrors: APIValidationError[]): FormValidationState {
    if (!validationErrors || validationErrors.length == 0) return null;
    
    let formValidationState = {} as FormValidationState;
    validationErrors.forEach((ave: APIValidationError) => {
        updateComponentStates(formValidationState, ave);
    });

    return formValidationState;
}

function updateComponentStates(formValidationState: FormValidationState, ave: APIValidationError) {
    let compPres = mapPathToComponents( ave.path )

    compPres.componentIds.forEach( function ( componentId ) {
        if ( !formValidationState[ componentId ] )
            formValidationState[ componentId ] = {}

        if ( !formValidationState[ componentId ][ ave.path ] ) 
            formValidationState[ componentId ][ ave.path ] = []

        formValidationState[ componentId ][ ave.path ].push( convertToValidationErrorState( ave, compPres.order ) )
    } )
}

function convertToValidationErrorState(ave: APIValidationError, order: number ): ValidationErrorState {
    let errorState = {
        type: ERROR_TYPE.VALIDATION,
        status: 400,
        message: ave.message,
        messageTemplate: ave.messageTemplate,
        messageArguments: ave.messageArguments,
        path: ave.path,
        displayMessage: ErrorMessages[ave.message] ? ErrorMessages[ave.message](ave) : ave.message,
        order
    }

    return errorState;
}

export function convertIncidentToSimpleIncident(incident: WildfireIncidentResource): SimpleWildfireIncidentResource {
    if (incident) {
        return {
            wildfireYear: incident.wildfireYear,
            incidentNumberSequence: incident.incidentNumberSequence,
            discoveryTimestamp: incident.discoveryTimestamp,
            fireCentreOrgUnitName: incident.fireCentreOrgUnitName,
            zoneOrgUnitName: incident.zoneOrgUnitName,
            incidentLabel: incident.incidentLabel,
            latitude: incident.incidentLocation ? incident.incidentLocation.latitude : undefined,
            longitude: incident.incidentLocation ? incident.incidentLocation.longitude : undefined,
            incidentTypeCode: incident.incidentTypeCode,
            incidentCommanderName: incident.incidentCommanderName,
            incidentStatusCode: incident.incidentStatusCode,
            suspectedCauseCategoryCode: incident.suspectedCauseCategoryCode,
            interfaceFireInd: incident.incidentSituation ? incident.incidentSituation.interfaceFireInd : undefined,
            stageOfControlCode: incident.incidentSituation ? incident.incidentSituation.stageOfControlCode : undefined,
            fireSizeHectares: incident.incidentSituation ? incident.incidentSituation.fireSizeHectares : undefined,
            geographicDescription: incident.incidentLocation ? incident.incidentLocation.geographicDescription : undefined
        }
    }
    return undefined;
}