import { DomSanitizer } from '@angular/platform-browser';
import { UntypedFormGroup } from '@angular/forms';
import {
  ErrorState,
  ValidationError,
} from '../../store/application/application.state';
import { getDisplayErrorMessage } from '../../utils/error-messages';

export class BaseComponentModel {
  public base = [];
  DISPLAY_ERROR_MESSAGE = getDisplayErrorMessage;

  formControlNameErrorMap = new Map();
  formControlNameErrors = new Map();
  errorState: ErrorState[];
  validationErrors: ValidationError[];
  formGroup: UntypedFormGroup;

  constructor(protected sanitizer: DomSanitizer) {
    this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  public clone(): BaseComponentModel {
    const clonedModel: BaseComponentModel = new BaseComponentModel(
      this.sanitizer,
    );
    clonedModel.base = this.base;
    return clonedModel;
  }

  public setErrorState(errorState: ErrorState[]) {
    this.errorState = errorState;
    this.validationErrors = [];
    for (const error of this.errorState) {
      if (error.validationErrors) {
        this.validationErrors.push.apply(
          this.validationErrors,
          error.validationErrors,
        );
      }
    }
    this.formControlNameErrors = new Map();
    Object.keys(this.formGroup.controls).forEach((element) => {
      const elementErrors = this.setErrors(element);
      if (elementErrors) {
        this.formControlNameErrors.set(element, elementErrors);
      }
    });
    this.updateValidators();
  }

  setErrors(formControl: string) {
    const formControlErrorTemplates = this.formControlNameErrorMap.get(
      formControl,
    ) as string[];
    if (
      this.validationErrors &&
      formControlErrorTemplates &&
      formControlErrorTemplates.length > 0
    ) {
      const formControlValidationErrors = this.validationErrors.filter(
        (validationError) =>
          formControlErrorTemplates.includes(validationError.message),
      );
      const valErrors = formControlValidationErrors.map((validationError) =>
        this.DISPLAY_ERROR_MESSAGE(validationError),
      );
      if (valErrors && valErrors.length > 0) {
        return {
          msgs: '<span>' + valErrors.join('</span><br/><span>') + '</span>',
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  public getErrors(formControl: string) {
    return this.formControlNameErrors.get(formControl);
  }

  protected updateValidators() {
    this.formControlNameErrorMap.forEach((value: string[], key: string) => {
      this.formGroup.controls[key].updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
      this.formGroup.controls[key].markAsTouched({ onlySelf: true });
    });
  }
}
