import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { HelpDocumentService } from "src/app/services/help-document.service";

@Component({
    selector: 'wfone-help-dialog',
    templateUrl: './help-dialog.component.html',
    styleUrls: [ '../../services/help-document.service/help-document.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpDialogComponent implements OnInit, OnDestroy {

    topicStack = []
    docTitle    
    docHtml

    constructor(
        @Inject( MAT_DIALOG_DATA ) public data: { topic: string },
        private dialogRef: MatDialogRef<HelpDialogComponent>,
        protected changeDetector: ChangeDetectorRef,
        private helpDocumentService: HelpDocumentService
    ) {}

    ngOnInit() {
        const self = this

        window[ 'markdownEventEmitter' ].on( 'click', function ( ev ) {
            if ( ev.arg.topic ) {
                self.openDoc( ev.arg.topic )
            }
        } )

        this.openDoc( this.data.topic )
    }

    ngOnDestroy(): void {
        window[ 'markdownEventEmitter' ].off( 'click' )
    }

    close() {
        this.dialogRef.close();
    }

    openDoc( topic: string ) {
        this.topicStack.push( topic )
        var doc = this.helpDocumentService.getDocument( topic )
        this.docHtml = doc.html
        this.docTitle = doc.title
        this.changeDetector.detectChanges()
        this.helpDocumentService.setTopicSeen( topic )
    }

    canGoBack() {
        return this.topicStack.length > 1
    }

    goBack() {
        if ( !this.canGoBack() ) return

        this.topicStack.pop()
        var doc = this.helpDocumentService.getDocument( this.topicStack[ this.topicStack.length - 1 ] )
        this.docHtml = doc.html
        this.docTitle = doc.title
        this.changeDetector.detectChanges()
    }
}
