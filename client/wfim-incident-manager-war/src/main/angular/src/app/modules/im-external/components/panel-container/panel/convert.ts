import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import {
    AssessmentValueAtRiskResource,
    ComplianceAndEnforcementInvestigationResource,
    ForestFuelResource,
    IncidentCauseResource,
    IncidentCommentResource,
    IncidentLandAuthorityResource,
    OriginAndCauseInvestigationResource,
    ResourceAllocationAssessmentResource,
    WildfireIncidentResource
} from "@wf1/incidents-rest-api";
import * as moment from "moment";
import { Moment } from "moment";
import { ResourceTypes } from "../../../../../resource/wfim/resource.types";
import { SpatialUtilsService } from "@wf1/core-ui";
import { DatePipe } from "@angular/common";
import { isIncidentTypeWithStageOfControl, isIncidentTypeWithStatus } from "../../../../../utils";

export class Convert {
    private static datePipe: DatePipe = new DatePipe('en-US');

    static mapFormValues<T>(formValues, resource: T): T {
        return Convert.mapProps(formValues, resource);
    }

    static mapProps(a, b) {
        for (const prop in a) {
            if (b.hasOwnProperty(prop)) {
                if (moment.isMoment(a[prop])) {
                    b[prop] = (a[prop] as Moment).valueOf();
                } else {
                    b[prop] = Convert.isObject(a[prop]) ? this.mapProps(a[prop], b[prop] || {}) : a[prop];
                }
            }
        }
        return b;
    }

    static isObject = (value) => value !== null && !Array.isArray(value) && typeof value === 'object';

    //form to resource------------------------------------------
    //General Incident Panel

    static generalFormToIncidentResource(formGroup: FormGroup, incident: WildfireIncidentResource, spatialUtils: SpatialUtilsService): WildfireIncidentResource {
        let formValues = formGroup.value;

        console.log("generalFormToIncidentResource formValues.incidentTypeCode: ", incident.incidentTypeCode);
        console.log("generalFormToIncidentResource isIncidentTypeWithStageOfControl: ", isIncidentTypeWithStageOfControl(formValues.incidentTypeCode));
        console.log("generalFormToIncidentResource isIncidentTypeWithStatus: ", isIncidentTypeWithStatus(formValues.incidentTypeCode));

        if (!formGroup.controls['latLong'].pristine) {
            let coordinates = spatialUtils.parseCoordinates(formValues.latLong);
            if (coordinates) {
                incident.incidentLocation.incidentLocationPoint = {
                    type: "Point",
                    coordinates
                }
            }
        }

        incident.incidentStatusCode = formValues.incidentStatusCode;
        incident.incidentLocation.finalLocationInd = formValues.finalLocationInd;
        incident.incidentSituation.interfaceFireInd = formValues.interfaceFireInd;
        incident.incidentLocation.geographicDescription = formValues.geographicDescription;
        incident.incidentSituation.containedPercentage = formValues.containedPercentage;
        incident.incidentSituation.stageOfControlCode = isIncidentTypeWithStatus(formValues.incidentTypeCode) ? null : formValues.stageOfControlCode;
        incident.simplexRadioFrequency.channelColour = formValues.simplexChannelColour;
        incident.duplexRadioFrequency.channelColour = formValues.duplexChannelColour;
        incident.duplexRadioFrequency.toneNumber = formValues.toneNumber;
        incident.leadByParty.partyName = formValues.leadByPartyName;
        incident.incidentSituation.siteAccessPointTypeCode = formValues.siteAccessPointTypeCode;
        incident.incidentSituation.accessDistanceMeters = formValues.accessDistanceMeters;
        incident.incidentSituation.accessDirectionCode = formValues.accessDirectionCode;
        incident.incidentSituation.availableWaterCode = formValues.availableWaterCode;
        incident.incidentSituation.availableWaterDistanceMeters = formValues.availableWaterDistanceMeters;
        incident.incidentSituation.waterDirectionCode = formValues.waterDirectionCode;
        incident.incidentSituation.valuesAtRiskDescription = formValues.valuesAtRiskDescription;
        incident.incidentSituation.valuesAtRiskDistanceMeters = formValues.valuesAtRiskDistanceMeters;
        incident.incidentSituation.valueDirectionCode = formValues.valueDirectionCode;

        return incident;
    }

    static commentFormToResource(formGroup: FormGroup): IncidentCommentResource {
        let formValues = formGroup.value;
        let commentResource = {
            "@type": "http://wfim.nrs.gov.bc.ca/v1/incidentComment",
            commenterGuid: null,
            comment: formValues.commentText,
            enteredTimestamp: new Date(),
            systemGeneratedCommentInd: false,
            commenterName: null
        };
        return commentResource;
    }

    //History Panel

    static historyFormToIncidentResource(formGroup: FormGroup, incident: WildfireIncidentResource): WildfireIncidentResource {
        let formValues = formGroup.value;
        incident.reportedTimestamp = formValues.reportedTimestamp ? moment(formValues.reportedTimestamp).toDate() : null;
        incident.firstActionedByParty.partyName = formValues.firstActionedByPartyName;
        incident.incidentSituation.fireOutDate = formValues.fireOutDate ? moment(formValues.fireOutDate).toDate() : null;
        incident.incidentSituation.fireBeingHeldDate = formValues.fireBeingHeldDate ? moment(formValues.fireBeingHeldDate).toDate() : null;
        incident.incidentSituation.fireContainedDate = formValues.fireContainedDate ? moment(formValues.fireContainedDate).toDate() : null;
        incident.incidentSituation.fireUnderControlDate = formValues.fireUnderControlDate ? moment(formValues.fireUnderControlDate).toDate() : null;
        return incident;
    }


    //Fire Characteristics Panel

    static fuelArrayResourceToForm(incident: WildfireIncidentResource, formGroup: FormGroup, reportedFuelType: string, adjacentFuelType: string, fb: FormBuilder, addEmptyRsrcOnEmptyReportedFuelTypeList, addEmptyRsrcOnEmptyAdjacentFuelTypeList) {
        if ((formGroup && incident.forestFuelInventory.length) ||
            (formGroup && !incident.forestFuelInventory.length && (addEmptyRsrcOnEmptyReportedFuelTypeList || addEmptyRsrcOnEmptyAdjacentFuelTypeList))) {
            Convert.reportedFuelResourceToForm(incident, formGroup, reportedFuelType, fb, addEmptyRsrcOnEmptyReportedFuelTypeList);
            Convert.adjacentFuelResourceToForm(incident, formGroup, adjacentFuelType, fb, addEmptyRsrcOnEmptyAdjacentFuelTypeList);
        }
    }

    static reportedFuelResourceToForm(incident: WildfireIncidentResource, formGroup: FormGroup, reportedFuelType: string, fb: FormBuilder, addEmptyResourceOnEmptyList) {
        const resourceValues = incident.forestFuelInventory.filter(fuel => fuel.forestFuelReportTypeCode === reportedFuelType);

        let disabled = false;
        if (incident.signOffSignatureDate) {
            disabled = true;
        } else if (incident.approvalSignatureDate) {
            disabled = true;
        }
        let fuelValues: FormArray = formGroup.get("forestFuelInventoryReported") as FormArray;
        if (!fuelValues) {
            fuelValues = new FormArray([]);
        }
        while (fuelValues.length !== 0) {
            fuelValues.removeAt(0)
        }

        if (resourceValues.length > 0) {
            resourceValues.map((value, index) => {
                let updateValues = {
                    forestFuelCategoryCode: { value: value.forestFuelCategoryCode, disabled: disabled },
                    forestFuelTypeCode: { value: value.forestFuelTypeCode, disabled: disabled },
                    forestFuelDensityCode: { value: value.forestFuelDensityCode, disabled: disabled },
                    forestFuelAgeCode: { value: value.forestFuelAgeCode, disabled: disabled },
                    otherFuelDescription: { value: value.otherFuelDescription, disabled: disabled }
                };
                fuelValues.push(fb.group(updateValues));
            });
        }

        if (addEmptyResourceOnEmptyList && fuelValues.length === 0) {

            let updateValues = {
                forestFuelCategoryCode: { value: null, disabled: disabled },
                forestFuelTypeCode: { value: null, disabled: disabled },
                forestFuelDensityCode: { value: null, disabled: disabled },
                forestFuelAgeCode: { value: null, disabled: disabled },
                otherFuelDescription: { value: null, disabled: disabled }
            };

            fuelValues.push(fb.group(updateValues));
        }

    }

    static adjacentFuelResourceToForm(incident: WildfireIncidentResource, formGroup: FormGroup, adjacentFuelType: string, fb: FormBuilder, addEmptyResourceOnEmptyList) {
        const resourceValues = incident.forestFuelInventory.filter(fuel => fuel.forestFuelReportTypeCode === adjacentFuelType);
        let disabled = false;
        if (incident.signOffSignatureDate) {
            disabled = true;
        } else if (incident.approvalSignatureDate) {
            disabled = true;
        }
        let fuelValues: FormArray = formGroup.get("forestFuelInventoryAdjacent") as FormArray;
        if (!fuelValues) {
            fuelValues = new FormArray([]);
        }
        while (fuelValues.length !== 0) {
            fuelValues.removeAt(0)
        }
        if (resourceValues.length > 0) {
            resourceValues.map((value, index) => {
                let updateValues = {
                    forestFuelCategoryCode: { value: value.forestFuelCategoryCode, disabled: disabled },
                    forestFuelTypeCode: { value: value.forestFuelTypeCode, disabled: disabled },
                    forestFuelDensityCode: { value: value.forestFuelDensityCode, disabled: disabled },
                    forestFuelAgeCode: { value: value.forestFuelAgeCode, disabled: disabled },
                    otherFuelDescription: { value: value.otherFuelDescription, disabled: disabled }
                };
                fuelValues.push(fb.group(updateValues));
            });
        }

        if (addEmptyResourceOnEmptyList && fuelValues.length === 0) {

            let updateValues = {
                forestFuelCategoryCode: { value: null, disabled: disabled },
                forestFuelTypeCode: { value: null, disabled: disabled },
                forestFuelDensityCode: { value: null, disabled: disabled },
                forestFuelAgeCode: { value: null, disabled: disabled },
                otherFuelDescription: { value: null, disabled: disabled }
            };

            fuelValues.push(fb.group(updateValues));
        }

    }


    static fireCharacteristicFormToIncidentResource(formGroup: FormGroup, incident: WildfireIncidentResource): WildfireIncidentResource {
        let formValues = formGroup.value;

        incident.incidentSituation.windSpeedKilometersPerHour = formValues.windSpeedKilometersPerHour;
        incident.incidentSituation.windDirectionCode = formValues.windDirectionCode;
        incident.incidentSituation.slopeRatingCode = formValues.slopeRatingCode;
        incident.incidentSituation.slopePositionCode = formValues.slopePositionCode;
        incident.incidentSituation.aspectDirectionCode = formValues.aspectDirectionCode;
        incident.preferredWeatherStation.stationCode = formValues.stationCode;
        incident.incidentSituation.fireRankCode = formValues.fireRankCode;
        incident.incidentSituation.fireSizeHectares = formValues.fireSizeHectares;
        incident.incidentLocation.incidentLocationPointElevationMeters = formValues.incidentLocationPointElevationMeters;

        return incident;
    }

    static mapForestFuelFormValues(formValues, reportedFuelType: string, adjacentFuelType: string): ForestFuelResource[] {
        const adjacentFuel = Convert.mapForestFuelResource(formValues["forestFuelInventoryAdjacent"], adjacentFuelType);
        const reportedFuel = Convert.mapForestFuelResource(formValues["forestFuelInventoryReported"], reportedFuelType);
        return [...adjacentFuel, ...reportedFuel];
    }

    static mapForestFuelResource(data, type): ForestFuelResource[] {
        const values = { "@type": ResourceTypes.FOREST_FUEL, forestFuelReportTypeCode: type };
        return data.map(value => {
            let result = {
                forestFuelCategoryCode: null,
                forestFuelTypeCode: null,
                forestFuelDensityCode: null,
                forestFuelAgeCode: null,
                otherFuelDescription: null
            };
            result.forestFuelCategoryCode = value.forestFuelCategoryCode && value.forestFuelCategoryCode.length > 0 ? value.forestFuelCategoryCode : null;
            result.forestFuelTypeCode = value.forestFuelTypeCode && value.forestFuelTypeCode.length > 0 ? value.forestFuelTypeCode : null;
            result.forestFuelDensityCode = value.forestFuelDensityCode && value.forestFuelDensityCode.length > 0 ? value.forestFuelDensityCode : null;
            result.forestFuelAgeCode = value.forestFuelAgeCode && value.forestFuelAgeCode.length > 0 ? value.forestFuelAgeCode : null;
            result.otherFuelDescription = value.otherFuelDescription && value.otherFuelDescription.length > 0 ? value.otherFuelDescription : null;

            return { ...result, ...values };
        });
    }

    // Land Authority Panel

    static landAuthorityFormToLandAuthorityResource(formGroup: FormGroup, landAuthority: IncidentLandAuthorityResource): IncidentLandAuthorityResource {
        let formValues = formGroup.value;

        landAuthority.landOwnershipClassCode = formValues.landOwnershipClassCode;
        landAuthority.managingParty.partyName = formValues.partyName;
        landAuthority.landManagerName = formValues.landManagerName;
        landAuthority.landManagerPhoneNumber = formValues.landManagerPhoneNumber;
        landAuthority.landManagerComment = formValues.landManagerComment;
        landAuthority.landOwnerName = formValues.landOwnerName;
        landAuthority.landOwnerPhoneNumber = formValues.landOwnerPhoneNumber;
        landAuthority.landOwnerAddress = formValues.landOwnerAddress;
        landAuthority.costSharingAgreementInd = formValues.costSharingAgreementInd;

        return landAuthority;
    }

    // C&E Panel

    static ceFormToCEResource(formGroup: FormGroup, ceInvestigation: ComplianceAndEnforcementInvestigationResource): ComplianceAndEnforcementInvestigationResource {
        let formValues = formGroup.value;

        ceInvestigation.resourcesRequestedInd = formValues.resourcesRequestedInd;
        ceInvestigation.agencyRespondedInd = formValues.agencyRespondedInd;
        ceInvestigation.investigatingParty.partyName = formValues.partyName;
        ceInvestigation.investigatorName = formValues.investigatorName;
        ceInvestigation.investigationReferenceNumber = formValues.investigationReferenceNumber;
        ceInvestigation.investigationDeterminationStatusCode = formValues.investigationDeterminationStatusCode;
        ceInvestigation.investigationRequestedTimestamp = formValues.investigationRequestedTimestamp ? new Date(formValues.investigationRequestedTimestamp) : null;
        ceInvestigation.investigationAgencyRespondedTimestamp = formValues.investigationAgencyRespondedTimestamp ? new Date(formValues.investigationAgencyRespondedTimestamp) : null;
        ceInvestigation.investigationRequesterCode = formValues.investigationRequesterCode;

        return ceInvestigation;
    }

    static ceFormToCEIncidentResource(formGroup: FormGroup, incident: WildfireIncidentResource): WildfireIncidentResource {
        let formValues = formGroup.value;

        return incident;
    }

    // Costs Panel

    static costFormToIncidentResource(formGroup: FormGroup, incident: WildfireIncidentResource): WildfireIncidentResource {
        let formValues = formGroup.value;

        incident.incidentSituation.actualCostOfControl = formValues.actualCostOfControl;

        return incident;
    }


    // Cause Panel

    static ocInvestigationFormToOCInvestigationResource(formGroup: FormGroup, ocInvestigation: OriginAndCauseInvestigationResource): OriginAndCauseInvestigationResource {
        let formValues = formGroup.value;

        ocInvestigation.resourcesRequestedInd = formValues.resourcesRequestedInd;
        ocInvestigation.agencyRespondedInd = formValues.agencyRespondedInd;
        ocInvestigation.investigatorName = formValues.investigatorName;
        ocInvestigation.investigationRequestedTimestamp = formValues.investigationRequestedTimestamp ? new Date(formValues.investigationRequestedTimestamp) : null;
        ocInvestigation.investigationAgencyRespondedTimestamp = formValues.investigationAgencyRespondedTimestamp ? new Date(formValues.investigationAgencyRespondedTimestamp) : null;
        ocInvestigation.investigationRequesterCode = formValues.investigationRequesterCode;
        return ocInvestigation;
    }


    //RSWAP Panel

    static rswapArrayResourceToForm(incident: WildfireIncidentResource, rswap: ResourceAllocationAssessmentResource, formGroup: FormGroup, fb: FormBuilder) {
        const resourceValues = rswap.assessmentValueAtRisks;
        let disabled = false;
        if (incident.signOffSignatureDate) {
            disabled = true;
        } else if (incident.approvalSignatureDate) {
            disabled = true;
        }
        let riskValues: FormArray = formGroup.get("assessmentValueAtRisks") as FormArray;
        if (!riskValues) {
            riskValues = new FormArray([]);
        }
        while (riskValues.length !== 0) {
            riskValues.removeAt(0)
        }
        if (resourceValues.length > 0) {
            resourceValues.map((value, index) => {
                let updateValues = {
                    valueAtRiskTypeCode: { value: value.valueAtRiskTypeCode, disabled: disabled },
                    valueAtRiskSubtypeCode: { value: value.valueAtRiskSubtypeCode, disabled: disabled },
                    assessmentReportPeriodCode: { value: value.assessmentReportPeriodCode, disabled: disabled }
                };
                riskValues.push(fb.group(updateValues));
            });
        }


    }
    static mapRswapFormValues(formValues): AssessmentValueAtRiskResource[] {
        const rswap = Convert.mapRswapResource(formValues["assessmentValueAtRisks"]);
        return [...rswap];
    }

    static mapRswapResource(data): AssessmentValueAtRiskResource[] {
        const values = { "@type": ResourceTypes.ASSESSMENT_VALUE_AT_RISK };
        return data.map(value => {
            let result = {
                valueAtRiskTypeCode: null,
                valueAtRiskSubtypeCode: null,
                assessmentReportPeriodCode: null
            };
            result.valueAtRiskTypeCode = value.valueAtRiskTypeCode && value.valueAtRiskTypeCode.length > 0 ? value.valueAtRiskTypeCode : null;
            result.valueAtRiskSubtypeCode = value.valueAtRiskSubtypeCode && value.valueAtRiskSubtypeCode.length > 0 ? value.valueAtRiskSubtypeCode : null;
            result.assessmentReportPeriodCode = value.assessmentReportPeriodCode && value.assessmentReportPeriodCode.length > 0 ? value.assessmentReportPeriodCode : null;

            return { ...result, ...values };
        });
    }

    static rswapFormToRswapResource(formGroup: FormGroup, rswap: ResourceAllocationAssessmentResource): ResourceAllocationAssessmentResource {
        let formValues = formGroup.value;

        rswap.fireAnalysisStatusCode = formValues.fireAnalysisStatusCode;
        rswap.responseObjectiveComment = formValues.responseObjectiveComment;
        rswap.controlChanceOfSuccessCode = formValues.controlChanceOfSuccessCode;
        rswap.evacuationAlertInd = formValues.evacuationAlertInd ? formValues.evacuationAlertInd : false;
        rswap.evacuationOrderInd = formValues.evacuationOrderInd ? formValues.evacuationOrderInd : false;
        rswap.privateAssetDamagedInd = formValues.privateAssetDamagedInd ? formValues.privateAssetDamagedInd : false;
        rswap.valuesAtRiskDescription = formValues.valuesAtRiskDescription;
        rswap.otherConsiderationComment = formValues.otherConsiderationComment;
        rswap.riskEstimatedValue = formValues.riskEstimatedValue;
        rswap.fireAnalysisEstimatedCost = formValues.fireAnalysisEstimatedCost;
        rswap.fireCentrePriorityRank = formValues.fireCentrePriorityRank;
        rswap.provincialPriorityRank = formValues.provincialPriorityRank;
        rswap.assessmentValueAtRisks = formValues.assessmentValueAtRisks;
        return rswap;
    }

    //To Form-------------------------

    static incidentResourceToForm(incident: WildfireIncidentResource, spatialUtils: SpatialUtilsService) {

        // console.log("incidentResourceToForm incident.incidentTypeCode: ", incident.incidentTypeCode);
        // console.log("incidentResourceToForm isIncidentTypeWithStageOfControl: ", isIncidentTypeWithStageOfControl(incident.incidentTypeCode));
        // console.log("incidentResourceToForm isIncidentTypeWithStatus: ", isIncidentTypeWithStatus(incident.incidentTypeCode));

        const fireSizeHectares = (incident.incidentSituation.fireSizeHectares === undefined
            || incident.incidentSituation.fireSizeHectares == null) ? '' : incident.incidentSituation.fireSizeHectares;

        let result = {
            incidentStatusCode: incident.incidentStatusCode,
            incidentTimestamp: incident.incidentTimestamp ? new Date(incident.incidentTimestamp) : null,
            reportedTimestamp: incident.reportedTimestamp ? new Date(incident.reportedTimestamp) : null,
            detectionSourceCode: incident.detectionSourceCode,
            discoverySizeHectares: incident.discoverySizeHectares,
            discoveryTimestamp: incident.discoveryTimestamp ? new Date(incident.discoveryTimestamp) : null,
            lastUpdatedTimestamp: incident.lastUpdatedTimestamp ? new Date(incident.lastUpdatedTimestamp) : null,
            firstActionedByPartyName: incident.firstActionedByParty ? incident.firstActionedByParty.partyName : null,
            firstAgencyToActionIncidentTimestamp: incident.firstAgencyToActionIncidentTimestamp ? new Date(incident.firstAgencyToActionIncidentTimestamp) : null,
            leadByPartyName: incident.leadByParty ? incident.leadByParty.partyName : null,
            leadAgencyStartTimestamp: incident.leadAgencyStartTimestamp ? new Date(incident.leadAgencyStartTimestamp) : null,
            leadAgencyEndTimestamp: incident.leadAgencyEndTimestamp ? new Date(incident.leadAgencyEndTimestamp) : null,

            valuesAtRiskDescription: incident.incidentSituation.valuesAtRiskDescription,
            valuesAtRiskDistanceMeters: incident.incidentSituation.valuesAtRiskDistanceMeters ? incident.incidentSituation.valuesAtRiskDistanceMeters : '',
            valueDirectionCode: incident.incidentSituation.valueDirectionCode,
            windSpeedKilometersPerHour: incident.incidentSituation.windSpeedKilometersPerHour ? incident.incidentSituation.windSpeedKilometersPerHour : '',
            windDirectionCode: incident.incidentSituation.windDirectionCode,
            slopeRatingCode: incident.incidentSituation.slopeRatingCode,
            slopePositionCode: incident.incidentSituation.slopePositionCode,
            aspectDirectionCode: incident.incidentSituation.aspectDirectionCode,
            siteAccessPointTypeCode: incident.incidentSituation.siteAccessPointTypeCode,
            accessDistanceMeters: incident.incidentSituation.accessDistanceMeters ? incident.incidentSituation.accessDistanceMeters : '',
            accessDirectionCode: incident.incidentSituation.accessDirectionCode,
            availableWaterCode: incident.incidentSituation.availableWaterCode,
            availableWaterDistanceMeters: incident.incidentSituation.availableWaterDistanceMeters ? incident.incidentSituation.availableWaterDistanceMeters : '',
            waterDirectionCode: incident.incidentSituation.waterDirectionCode,
            paperTrailedInd: incident.paperTrailedInd,
            stationCode: incident.preferredWeatherStation.stationCode !== undefined && incident.preferredWeatherStation.stationCode !== null ? `${incident.preferredWeatherStation.stationCode}` : null,
            probabilityOfInitialAttackSuccessCode: incident.probabilityOfInitialAttackSuccessCode,
            fieldPhotoInd: incident.fieldPhotoInd,

            // originAndCauseInvestigationRequesterCode: incident.originAndCauseInvestigationRequesterCode,
            suspectedCauseCategoryCode: incident.suspectedCauseCategoryCode,

            // complianceAndEnforcementInvestigationRequesterCode: incident.complianceAndEnforcementInvestigationRequesterCode,
            damageToNaturalResourcesEstimate: incident.damageToNaturalResourcesEstimate ? incident.damageToNaturalResourcesEstimate : '',
            claimExpectedInd: incident.claimExpectedInd,

            incidentLabel: incident.incidentLabel ? incident.incidentLabel : '',
            incidentName: incident.incidentName ? incident.incidentName : '',
            incidentCategoryCode: incident.incidentCategoryCode,
            incidentTypeCode: incident.incidentTypeCode,
            fireClassificationCode: incident.fireClassificationCode,
            fireCentreOrgUnitIdentifier: incident.fireCentreOrgUnitIdentifier,
            zoneOrgUnitIdentifier: incident.zoneOrgUnitIdentifier,
            incidentLocationPointElevationMeters: incident.incidentLocation.incidentLocationPointElevationMeters ? incident.incidentLocation.incidentLocationPointElevationMeters : '',
            latLong: Convert.getFormattedLatLong(incident, spatialUtils),
            interfaceFireInd: incident.incidentSituation.interfaceFireInd,
            responseTypeCode: incident.responseTypeCode,
            geographicDescription: incident.incidentLocation.geographicDescription ? incident.incidentLocation.geographicDescription : '',
            fireSizeHectares: fireSizeHectares,
            fireSizeLastUpdatedTimestamp: incident.incidentSituation.fireSizeLastUpdatedTimestamp ? new Date(incident.incidentSituation.fireSizeLastUpdatedTimestamp) : null,
            fireSizeLastUpdatedTimestampDisplay: incident.incidentSituation.fireSizeLastUpdatedTimestamp ? Convert.formatDateTimeToDisplayString(new Date(incident.incidentSituation.fireSizeLastUpdatedTimestamp)) : undefined,
            stageOfControlCode: isIncidentTypeWithStatus(incident.incidentTypeCode) ? null : incident.incidentSituation.stageOfControlCode,
            incidentCommanderName: incident.incidentCommanderName ? incident.incidentCommanderName : '',
            containedPercentage: incident.incidentSituation.containedPercentage ? incident.incidentSituation.containedPercentage : '',
            fireOfNotePublishedInd: incident.fireOfNotePublishedInd,
            fireRankCode: incident.incidentSituation.fireRankCode,
            actualCostOfControl: incident.incidentSituation.actualCostOfControl ? incident.incidentSituation.actualCostOfControl : '',
            simplexChannelColour: incident.simplexRadioFrequency.channelColour,
            duplexChannelColour: incident.duplexRadioFrequency.channelColour,
            toneNumber: incident.duplexRadioFrequency.toneNumber,

            rehabilitationPlanRequiredInd: incident.rehabilitationPlanRequiredInd,

            incidentId: [{ value: `${incident.wildfireYear}-${incident.incidentNumberSequence}`, disabled: true }],

            signOffSignatureName: incident.signOffSignatureName,
            signOffSignatureDateDisplay: incident.signOffSignatureDate ? Convert.formatDateToDisplayString(new Date(incident.signOffSignatureDate)) : undefined,
            approvalSignatureName: incident.approvalSignatureName,
            approvalSignatureDateDisplay: incident.approvalSignatureDate ? Convert.formatDateToDisplayString(new Date(incident.approvalSignatureDate)) : undefined,
        };

        return result;
    }

    static causeResourceToForm(cause: IncidentCauseResource) {
        let result = {
            generalIncidentCauseCategoryCode: cause.generalIncidentCauseCategoryCode ? cause.generalIncidentCauseCategoryCode : '',
            completeCauseInd: cause.completeCauseInd ? cause.completeCauseInd : '',
            incidentCauseReasonCategoryCode: cause.incidentCauseReasonCategoryCode ? cause.incidentCauseReasonCategoryCode : '',
            incidentCauseReasonKindCode: cause.incidentCauseReasonKindCode ? cause.incidentCauseReasonKindCode : '',
            forestActivityCategoryCode: cause.forestActivityCategoryCode ? cause.forestActivityCategoryCode : '',
            forestActivityKindCode: cause.forestActivityKindCode ? cause.forestActivityKindCode : '',
            incidentCauseActivityCategoryCode: cause.incidentCauseActivityCategoryCode ? cause.incidentCauseActivityCategoryCode : '',
            incidentCauseActivityKindCode: cause.incidentCauseActivityKindCode ? cause.incidentCauseActivityKindCode : '',
            incidentCauseActivitySubkindCode: cause.incidentCauseActivitySubkindCode ? cause.incidentCauseActivitySubkindCode : '',
            causeCertaintyCode: cause.causeCertaintyCode ? cause.causeCertaintyCode : '',
            incidentCauseComment: cause.incidentCauseComment ? cause.incidentCauseComment : ''
        };

        return result;
    }

    static ocInvestigationResourceToForm(ocInvestigation: OriginAndCauseInvestigationResource) {
        let result = {
            resourcesRequestedInd: ocInvestigation.resourcesRequestedInd,
            agencyRespondedInd: ocInvestigation.agencyRespondedInd,
            investigatorName: ocInvestigation.investigatorName,
            investigationRequestedTimestamp: ocInvestigation.investigationRequestedTimestamp ? new Date(ocInvestigation.investigationRequestedTimestamp) : null,
            investigationAgencyRespondedTimestamp: ocInvestigation.investigationAgencyRespondedTimestamp ? new Date(ocInvestigation.investigationAgencyRespondedTimestamp) : null,
            investigationRequesterCode: ocInvestigation.investigationRequesterCode
        };

        return result;
    }

    static ceInvestigationResourceToForm(ceInvestigation: ComplianceAndEnforcementInvestigationResource) {
        let result = {
            resourcesRequestedInd: ceInvestigation.resourcesRequestedInd,
            agencyRespondedInd: ceInvestigation.agencyRespondedInd,
            partyName: ceInvestigation.investigatingParty.partyName,
            investigatorName: ceInvestigation.investigatorName,
            investigationReferenceNumber: ceInvestigation.investigationReferenceNumber,
            investigationDeterminationStatusCode: ceInvestigation.investigationDeterminationStatusCode,
            investigationRequestedTimestamp: ceInvestigation.investigationRequestedTimestamp ? new Date(ceInvestigation.investigationRequestedTimestamp) : null,
            investigationAgencyRespondedTimestamp: ceInvestigation.investigationAgencyRespondedTimestamp ? new Date(ceInvestigation.investigationAgencyRespondedTimestamp) : null,
            investigationRequesterCode: ceInvestigation.investigationRequesterCode
        };

        return result;
    }

    static landAuthorityResourceToForm(landAuthority: IncidentLandAuthorityResource) {
        let result = {
            landOwnershipClassCode: landAuthority.landOwnershipClassCode,
            partyName: landAuthority.managingParty.partyName,
            landManagerName: landAuthority.landManagerName,
            landManagerPhoneNumber: landAuthority.landManagerPhoneNumber ? landAuthority.landManagerPhoneNumber.replace(/\D/g, '') : null,
            landManagerComment: landAuthority.landManagerComment ? landAuthority.landManagerComment : '',
            landOwnerName: landAuthority.landOwnerName,
            landOwnerPhoneNumber: landAuthority.landOwnerPhoneNumber ? landAuthority.landOwnerPhoneNumber.replace(/\D/g, '') : null,
            landOwnerAddress: landAuthority.landOwnerAddress,
            costSharingAgreementInd: landAuthority.costSharingAgreementInd ? landAuthority.costSharingAgreementInd : false
        };

        return result;
    }

    static rswapResourceToForm(rswap: ResourceAllocationAssessmentResource) {
        let result = {
            fireAnalysisStatusCode: rswap.fireAnalysisStatusCode,
            responseObjectiveComment: rswap.responseObjectiveComment,
            controlChanceOfSuccessCode: rswap.controlChanceOfSuccessCode,
            evacuationAlertInd: rswap.evacuationAlertInd,
            evacuationOrderInd: rswap.evacuationOrderInd,
            privateAssetDamagedInd: rswap.privateAssetDamagedInd,
            valuesAtRiskDescription: rswap.valuesAtRiskDescription,
            otherConsiderationComment: rswap.otherConsiderationComment,
            riskEstimatedValue: rswap.riskEstimatedValue ? rswap.riskEstimatedValue : '',
            fireAnalysisEstimatedCost: rswap.fireAnalysisEstimatedCost ? rswap.fireAnalysisEstimatedCost : '',
            fireCentrePriorityRank: rswap.fireCentrePriorityRank ? rswap.fireCentrePriorityRank : '',
            provincialPriorityRank: rswap.provincialPriorityRank,
            fireCentrePriorityRankLastModified: Convert.formatLastModifiedBy(rswap.fireCentreAssessedByName, rswap.fireCentreAssessedTimestamp),
            provincialPriorityRankLastModified: Convert.formatLastModifiedBy(rswap.provincialAssessedByName, rswap.provincialAssessedTimestamp)
        };

        return result;
    }

    static getFormattedLatLong(incident, spatialUtils) {
        return incident.incidentLocation ? spatialUtils.formatCoordinates([incident.incidentLocation.longitude, incident.incidentLocation.latitude]) : '';
    }

    static formatDateToDisplayString(date: Date) {
        if (date) {
            return Convert.datePipe.transform(date, 'longDate');
        }

        return undefined;
    }

    static formatDateTimeToDisplayString(date: Date) {
        if (date) {
            return Convert.datePipe.transform(date, 'yyyy-MM-dd HH:mm');
        }

        return undefined;
    }

    static formatLastModifiedBy(name: string, date: Date) {
        if (!name) {
            return '';
        }
        if (!date) {
            return name;
        }

        return `${name} ${Convert.datePipe.transform(date, 'longDate')}`
    }


}
