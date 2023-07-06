import {DomSanitizer} from "@angular/platform-browser";
import {getDisplayErrorMessage} from "../../utils/error-messages";
import {ErrorState, ValidationError} from "../../store/application/application.state";
import {FormGroup} from "@angular/forms";

export class BaseComponentModel {
    public base = [];
    DISPLAY_ERROR_MESSAGE = getDisplayErrorMessage;

    formControlNameErrorMap = new Map();
    formControlNameErrors = new Map();
    errorState: ErrorState[];
    validationErrors: ValidationError[];
    formGroup: FormGroup;

    constructor(protected sanitizer: DomSanitizer) {
        this.sanitizer.bypassSecurityTrustResourceUrl('');
        this.initFormErrorMappings();
    }

    public clone(): BaseComponentModel {
        let clonedModel: BaseComponentModel = new BaseComponentModel(this.sanitizer);
        clonedModel.base = this.base;
        return clonedModel;
    }

    public setErrorState(errorState: ErrorState[]) {
        this.errorState = errorState;
        this.validationErrors = [];
        for (let error of this.errorState) {
            if (error.validationErrors) {
                this.validationErrors.push.apply(this.validationErrors, error.validationErrors);
            }
        }
        this.formControlNameErrors = new Map();
        Object.keys(this.formGroup.controls).forEach(element => {
            let elementErrors = this.setErrors(element);
            if (elementErrors) {
                this.formControlNameErrors.set(element, elementErrors);
            }
        });
        this.updateValidators();
    }


    setErrors(formControl: string) {
        let formControlErrorTemplates = this.formControlNameErrorMap.get(formControl) as string[];
        if (this.validationErrors && formControlErrorTemplates && formControlErrorTemplates.length > 0) {
            let formControlValidationErrors = this.validationErrors.filter(validationError => formControlErrorTemplates.includes(validationError.message));
            let valErrors = formControlValidationErrors.map(validationError => this.DISPLAY_ERROR_MESSAGE(validationError));
            if (valErrors && valErrors.length > 0) {
                return {msgs: "<span>" + valErrors.join("</span><br/><span>") + "</span>"};
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

    //should be overridden if field level api errors need to be shown - see profile as reference
    protected initFormErrorMappings() {
    }

    protected updateValidators() {
        this.formControlNameErrorMap.forEach((value: string[], key: string) => {
            this.formGroup.controls[key].updateValueAndValidity({onlySelf: true, emitEvent: false});
            this.formGroup.controls[key].markAsTouched({onlySelf: true});
        });
    }
}
