import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { AttachmentResource } from '@wf1/incidents-rest-api';
import { PhotoFilter } from '../../../../core/photo/photo-gallery/photo-gallery.component';
import { BasePanelComponent } from './base.panel.component';
import { CollectionNoticeDialogComponent } from './collection-notice-dialog/collection-notice-dialog.component';

@Component({
    selector: 'wfim-photos-panel',
    templateUrl: './photos-panel.component.html',
    styleUrls: ['./base-panel.component.scss', './photos-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PhotosPanelComponent extends BasePanelComponent {
    readonly panelName: string = 'Photos and Videos';

    ngOnInit() {
        super.ngOnInit()
        this.showCollectionNoticeDialog();
    }

    createForm() {
        this.formGroup = this.fb.group( {} )
    }

    get attachmentCreator() {
        return ( fileId: string, uploadPath: string, mimeType: string, description: string, category: string ) => {
            let attachment = {
                '@type': 'http://wfim.nrs.gov.bc.ca/v1/attachment',
                type: 'http://wfim.nrs.gov.bc.ca/v1/attachment',

                sourceObjectNameCode: 'INCIDENT',
                fileName: uploadPath,
                attachmentDescription: description,
                attachmentTypeCode: category,
                fileIdentifier: fileId,
                mimeType: mimeType
            } as AttachmentResource

            /**
             * Add Incident Attachment
             * Add a Incident attachment resource to the List of Incident attachment resources
             * @param wildfireYear The wildfireYear of the Wildfire Incident resource.
             * @param incidentNumberSequence The incidentNumberSequence of the Wildfire Incident resource.
             * @param attachment The Attachment resource containing the new values.
             * @param restVersion The version of the Rest API supported by the requesting client.
             * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
             * @param reportProgress flag to report request and response progress.
             */
            return this.incidentAttachmentsService.createIncidentAttachment(
                '' + this.incident.wildfireYear,// wildfireYear: string,
                '' + this.incident.incidentNumberSequence,// incidentNumberSequence: string,
                attachment,
                undefined,
                'response'
            ).toPromise()
        }
    }

    get attachmentUpdater() {
        return ( att: AttachmentResource ) => {
            return this.incidentAttachmentService.updateIncidentAttachment(
                '' + this.incident.wildfireYear,// wildfireYear: string,
                '' + this.incident.incidentNumberSequence,// incidentNumberSequence: string,
                att.attachmentGuid, // attachmentGuid: string,
                att
            ).toPromise()
        }
    }

    get attachmentListUpdater() {
        return ( filter: PhotoFilter ) => {
            /**
             * Get Incident Attachments.
             * Get list of Incident Attachments.
             * @param wildfireYear The wildfireYear of the Wildfire Incident resource.
             * @param incidentNumberSequence The incidentNumberSequence of the Wildfire Incident resource.
             * @param archived List archived attachments
             * @param privateIndicator List private attachments
             * @param sourceObjectNameCode The sourceObjectNameCode the results to be returned.
             * @param attachmentTypeCode The attachmentTypeCode the results to be returned.
             * @param uploadedByUserId The uploadedByUserId the results to be returned.
             * @param uploadedByByUserType The uploadedByByUserType the results to be returned.
             * @param uploadedByUserGuid The uploadedByUserGuid the results to be returned.
             * @param pageNumber The page number of the results to be returned.
             * @param pageRowCount The number of results per page.
             * @param orderBy Comma separated list of property names to order the result set by.
             * @param restVersion The version of the Rest API supported by the requesting client.
             * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
             * @param reportProgress flag to report request and response progress.
             */
            return this.incidentAttachmentsService.getIncidentAttachmentList(
                '' + this.incident.wildfireYear,
                '' + this.incident.incidentNumberSequence,
                '' + filter.archived,
                '' + filter.private,
                undefined,
                filter.category ? [ filter.category ] : undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                '1000',
                undefined,
                undefined,
                'body'
            ).toPromise().then( ( docs ) => {
                return docs.collection
            } )
        }
    }

    showCollectionNoticeDialog(){
        if (localStorage.getItem('dontShowCollectionNoticeWFIM') !== 'true') {
            let dialogRef = this.dialog.open(CollectionNoticeDialogComponent,{
                panelClass:"collection-notice-wrapper",
                width: this.applicationStateService.getDevice() == 'mobile'? '300vw':'450px',
                height: this.applicationStateService.getDevice() == 'mobile'? '300vw':undefined,
                closeOnNavigation: false
            })
            dialogRef.afterClosed().subscribe(result => {
                if(result['dontShowAgain']){
                    localStorage.setItem('dontShowCollectionNoticeWFIM', 'true');
                }
                else{
                    localStorage.removeItem('dontShowCollectionNoticeWFIM');
                }
            })
        }
    }

}
