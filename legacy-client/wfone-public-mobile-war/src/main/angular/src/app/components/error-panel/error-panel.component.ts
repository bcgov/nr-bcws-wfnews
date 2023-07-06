import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {ERROR_TYPE, ErrorState} from "../../store/application/application.state";
import {getDisplayErrorMessage} from "../../utils/error-messages";

@Component({
    selector: 'wfone-base-error-panel',
    templateUrl: './error-panel.component.html',
    styleUrls: ['../base/base.component.scss', './error-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorPanelComponent implements OnChanges {
    @Input() errorState: ErrorState[];
    @Input() title: string;
    @Input() errorType: 'WARNING' | 'ERROR';
    ERROR_TYPE = ERROR_TYPE;
    DISPLAY_ERROR_MESSAGE = getDisplayErrorMessage;

    constructor(protected cdr: ChangeDetectorRef) {

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.errorState) {
            this.errorState = <ErrorState[]>changes.errorState.currentValue;
        }
    }

    // Allow setting error state manually - used for dialogs
    setErrorState(errorState: ErrorState[]) {
        this.errorState = errorState;
        this.cdr.detectChanges();
    }

    clearErrorState() {
        this.errorState = [];
        this.cdr.detectChanges();
    }
}
