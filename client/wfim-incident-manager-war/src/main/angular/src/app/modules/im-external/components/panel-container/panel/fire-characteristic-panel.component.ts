import { ChangeDetectionStrategy, Component, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { WildfireIncidentResource } from '@wf1/incidents-rest-api';
import { clearIMFormComponentValidationState } from "../../../../../store/validation/validation.actions";
import { isEmpty } from "../../../../../utils";
import { BasePanelComponent } from './base.panel.component';
import { Convert } from "./convert";

@Component({
    selector: 'wfim-fire-characteristic-panel',
    templateUrl: './fire-characteristic-panel.component.html',
    styleUrls: ['./base-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FireCharacteristicPanelComponent extends BasePanelComponent {
    readonly panelName: string = 'Fire Characteristics';

    readonly adjacentFuelType = "Adjacent";
    readonly reportedFuelType = "Reported";

    readonly adjacentFuelId = "forestFuelInventoryAdjacent";
    readonly reportedFuelId = "forestFuelInventoryReported";

    readonly adjacentFuelLabel = "Fuels Adjacent";
    readonly adjacentFuelLabelSubText = "to area of origin";
    readonly reportedFuelLabel = "Fuels";
    readonly reportedFuelLabelSubText = "at area of origin";

    readonly sectionLabelFuels: string = 'Fuels';
    readonly sectionLabelInitialOnsiteWeather: string = 'Initial Onsite Weather';
    readonly sectionLabelTopography: string = 'Topography';

    ngOnInit() {
        super.ngOnInit();
        this.formGroup.disable()
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.incident && this.formGroup) {
            this.formGroup.patchValue(Convert.incidentResourceToForm(changes.incident.currentValue as WildfireIncidentResource, this.spatialUtils));
            Convert.fuelArrayResourceToForm(changes.incident.currentValue as WildfireIncidentResource, this.formGroup, this.reportedFuelType, this.adjacentFuelType, this.fb, true, true);
            this.formGroup.markAsPristine();
            if(!changes.incident.firstChange){
                this.formGroup.enable()
                this.formGroup.get('fireSizeLastUpdatedTimestampDisplay').disable();
                localStorage.removeItem('isLoading'+this.incident.incidentNumberSequence);
            }
            if (this.formGroup) {
                if (this.validationState && !isEmpty(this.validationState)) {
                    setTimeout(() => window.scrollTo(0, 0), 1000);
                    this.processValidationState();
                }
            }
        }
    }

    ngAfterViewInit() {
        Convert.fuelArrayResourceToForm(this.incident, this.formGroup, this.reportedFuelType, this.adjacentFuelType, this.fb, true, true);
        super.ngAfterViewInit();
    }

    createForm() {
        const fireSizeHectares = (this.incident.incidentSituation.fireSizeHectares === undefined
            || this.incident.incidentSituation.fireSizeHectares == null) ? '' : this.incident.incidentSituation.fireSizeHectares;

        this.formGroup = this.fb.group({
            windSpeedKilometersPerHour: [this.incident.incidentSituation.windSpeedKilometersPerHour ? this.incident.incidentSituation.windSpeedKilometersPerHour : '', [Validators.pattern('\\d*\\.?\\d{0,2}'), Validators.min(0)]],
            windDirectionCode: this.incident.incidentSituation.windDirectionCode,
            slopeRatingCode: this.incident.incidentSituation.slopeRatingCode,
            slopePositionCode: this.incident.incidentSituation.slopePositionCode,
            aspectDirectionCode: this.incident.incidentSituation.aspectDirectionCode,
            stationCode: this.incident.preferredWeatherStation.stationCode !== undefined && this.incident.preferredWeatherStation.stationCode !== null ? `${this.incident.preferredWeatherStation.stationCode}` : null,
            fireRankCode: this.incident.incidentSituation.fireRankCode,
            fireSizeHectares: [fireSizeHectares, [Validators.pattern('\\d*\\.?\\d{0,3}'), Validators.min(0)]],
            fireSizeLastUpdatedTimestamp: this.incident.incidentSituation.fireSizeLastUpdatedTimestamp ? new Date(this.incident.incidentSituation.fireSizeLastUpdatedTimestamp) : null,
            fireSizeLastUpdatedTimestampDisplay: [{ value: this.incident.incidentSituation.fireSizeLastUpdatedTimestamp ? Convert.formatDateTimeToDisplayString(new Date(this.incident.incidentSituation.fireSizeLastUpdatedTimestamp)) : undefined, disabled: true }],
            incidentLocationPointElevationMeters: [this.incident.incidentLocation.incidentLocationPointElevationMeters ? this.incident.incidentLocation.incidentLocationPointElevationMeters : '']
        });

    }

    onSubmit() {
        localStorage.setItem('isLoading'+this.incident.incidentNumberSequence, 'true');
        super.onSubmit();
        this.store.dispatch(clearIMFormComponentValidationState(`${this.incident.wildfireYear}${this.incident.incidentNumberSequence}`, 'fireCharacteristics'));
    }

    processValidationState() {
        if (this.formGroup) {
            this.checkForApiError('slopeRatingCode', 'incidentSituation.slopeRatingCode');
            this.checkForApiError('aspectDirectionCode', 'incidentSituation.aspectDirectionCode');
            this.checkForApiError('slopePositionCode', 'incidentSituation.slopePositionCode');
            this.checkForApiError('fireSizeHectares', 'incidentSituation.fireSizeHectares');
            this.checkForApiError('incidentLocationPointElevationMeters', 'incidentLocation.incidentLocationPointElevationMeters');
            this.checkForApiError('fireRankCode', 'incidentSituation.fireRankCode');
            this.checkForApiError('reported', 'forestFuelInventory.reported');
            this.checkForApiError('adjacent', 'forestFuelInventory.adjacent');
            this.checkForApiError('stationCode', 'preferredWeatherStation.stationCode');

        }
    }

    disableCheckboxes() {
    }

    copyFormToIncidentResource(): WildfireIncidentResource {
        this.formGroup.value["forestFuelInventory"] = Convert.mapForestFuelFormValues(this.formGroup.value, this.reportedFuelType, this.adjacentFuelType);

        let incident = super.copyFormToIncidentResource();
        return Convert.fireCharacteristicFormToIncidentResource(this.formGroup, incident);
    }
}
