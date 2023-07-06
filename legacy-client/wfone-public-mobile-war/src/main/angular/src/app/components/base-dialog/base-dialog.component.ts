import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from "@angular/core";
import {MatDialogRef} from "@angular/material";
import {ApplicationStateService} from "../../services/application-state.service";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: 'wfone-base-dialog',
    templateUrl: './base-dialog.component.html',
    styleUrls: ['../base/base.component.scss', './base-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseDialogComponent implements AfterViewInit {
    mobile:boolean;

    @Input() title:string;
    @Input() canGoBack:boolean = false
    @Input() showBack:boolean = true
    @Input() showClose:boolean = true
    @Input() showCancel:boolean = false
    @Input() showOK:boolean = false

    @Output() goBack = new EventEmitter<any>();
    @Output() accepted = new EventEmitter<any>();

    constructor(
        public dialogRef: MatDialogRef<BaseDialogComponent>,
        protected applicationStateService: ApplicationStateService,
        protected sanitizer: DomSanitizer,
        protected changeDetector: ChangeDetectorRef,
    ) {
        dialogRef.disableClose = true;
        this.mobile = this.applicationStateService.getIsMobileResolution();
    }
    
    ngAfterViewInit(): void {    
        // this.mobile = this.applicationStateService.getIsMobileResolution();
    }

    ok() {
        this.accepted.emit()
    }

    cancel() {
        this.dialogRef.close();
    }

    back() {
        this.goBack.emit()
        this.changeDetector.detectChanges()
    }
}    