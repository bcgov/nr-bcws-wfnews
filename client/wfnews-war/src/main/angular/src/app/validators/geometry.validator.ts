import {AbstractControl, ValidatorFn} from '@angular/forms';
import {SpatialUtilsService} from '@wf1/core-ui';

export function geometryValidator(spatialService: SpatialUtilsService): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } | null => {
		if (!control.value) {
			return null;
		}
		const coordinates = spatialService.parseCoordinates(control.value);
		if (!coordinates) {
			return { invalidGeom: 'The geometry is invalid' };
		}
		return null;
	};
}
