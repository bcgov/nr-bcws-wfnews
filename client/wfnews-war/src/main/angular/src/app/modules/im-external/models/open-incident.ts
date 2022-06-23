import {WildfireIncidentResource} from '@wf1/incidents-rest-api';
import {Observable} from "rxjs";
import {FormValidationState} from "../../../store/validation/validation.state";

export interface OpenIncident {
	id: string;
	label: string;
	etag?: string;
	incident?: WildfireIncidentResource;
	validationState?: Observable<FormValidationState>;
}
