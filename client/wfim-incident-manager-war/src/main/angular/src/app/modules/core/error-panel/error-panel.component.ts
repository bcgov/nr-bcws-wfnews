import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
    ComponentValidationState,
    ValidationErrorState
} from "../../../store/validation/validation.state";

@Component({
    selector: 'base-error-panel',
    templateUrl: './error-panel.component.html',
    styleUrls: ['./error-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPanelComponent implements OnChanges {
    @Input() componentValidationState: ComponentValidationState;
    @Input() title: string;

    displayErrors: Array<ValidationErrorState> = [];

    constructor(protected cdr: ChangeDetectorRef) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.componentValidationState) {
            this.componentValidationState = <ComponentValidationState>changes.componentValidationState.currentValue;

            if ( this.componentValidationState ) {
                this.displayErrors = Object.values(this.componentValidationState)
                    .reduce(function (acc, v) { return acc.concat(v) }, [])
                    .sort(function (a, b) { return a.order - b.order })
            }
            else {
                this.displayErrors = []
            }
        }
        //console.log('componentValidationState changes', changes.componentValidationState);
    }
}
