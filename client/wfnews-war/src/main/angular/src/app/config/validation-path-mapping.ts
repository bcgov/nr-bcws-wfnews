import { FormValidationState } from "../store/validation/validation.state";

export type ComponentId = ( keyof FormValidationState ) 

type ComponentPresentation = {
    componentIds: Array<ComponentId>,
    order: number
}

let order = 0
function nextOrder() { order += 1; return { order } }

function generalMapping(): ComponentPresentation { return { componentIds: [ 'general', 'signoff' ], ...nextOrder() } }
function historyMapping(): ComponentPresentation { return { componentIds: [ 'history', 'signoff' ], ...nextOrder() } }
function fireCharacteristicsMapping(): ComponentPresentation { return { componentIds: [ 'fireCharacteristics', 'signoff' ], ...nextOrder() } }
function landAuthorityMapping(): ComponentPresentation { return { componentIds: [ 'landAuthority', 'signoff' ], ...nextOrder() } }
function causeMapping(): ComponentPresentation { return { componentIds: [ 'cause', 'signoff' ], ...nextOrder() } }

// the order of the paths is the order they appear on the UI
const pathToComponents : { [ path: string ]: ComponentPresentation } = {
  "wildfireYear": generalMapping(),
  "incidentLabel": generalMapping(),
  "fireClassificationCode": generalMapping(),
  "responseTypeCode": generalMapping(),
  "incidentSituation.containedPercentage": generalMapping(),
  "incidentCommanderName": generalMapping(),
  "fireCentreOrgUnitIdentifier": generalMapping(), 
  "zoneOrgUnitIdentifier": generalMapping(),
  "incidentLocation.geographicDescription": generalMapping(),
  "latitude": generalMapping(),
  "longitude": generalMapping(),
  "incidentSituation.valuesAtRiskDescription": generalMapping(),
  "incidentSituation.siteAccessPointTypeCode": generalMapping(),
  "fieldPhotoInd": generalMapping(),

  "incidentTimestamp": historyMapping(),
  "reportedTimestamp": historyMapping(),
  "discoveryTimestamp": historyMapping(),
  "discoverySizeHectares": historyMapping(),
  "detectionSourceCode": historyMapping(),
  "firstActionedByParty": historyMapping(),
  "firstAgencyToActionIncidentTimestamp": { componentIds: [ 'history' ], ...nextOrder() }, 
  "incidentSituation.fireContainedDate": historyMapping(),
  "incidentSituation.fireUnderControlDate": historyMapping(),
  "incidentSituation.fireBeingHeldDate": historyMapping(),
  "incidentSituation.fireOutDate": historyMapping(),

  "incidentSituation.fireRankCode": fireCharacteristicsMapping(),
  "incidentSituation.fireSizeHectares": fireCharacteristicsMapping(),
  "forestFuelInventory.reported": fireCharacteristicsMapping(),
  "forestFuelInventory.adjacent": fireCharacteristicsMapping(),
  "preferredWeatherStation.stationCode": fireCharacteristicsMapping(),
  "incidentSituation.slopeRatingCode": fireCharacteristicsMapping(),
  "incidentSituation.slopePositionCode": fireCharacteristicsMapping(),
  "incidentSituation.aspectDirectionCode": fireCharacteristicsMapping(),
  "incidentLocation.incidentLocationPointElevationMeters": fireCharacteristicsMapping(),
  
  "managingLandAuthority.landOwnershipClassCode": landAuthorityMapping(),
  "managingLandAuthority.managingParty.partyName": landAuthorityMapping(),
//   "managingLandAuthority.costSharingAgreementInd": landAuthorityMapping(),
  
  "originAndCauseInvestigation.investigationRequestedTimestamp": causeMapping(),
  "suspectedCauseCategoryCode": causeMapping()
}

export function mapPathToComponents( path: string ): ComponentPresentation {
    if ( !( path in pathToComponents ) ) return {
        componentIds: [ 'uncategorized' ], order: 0
    }

    return pathToComponents[ path ]
}
