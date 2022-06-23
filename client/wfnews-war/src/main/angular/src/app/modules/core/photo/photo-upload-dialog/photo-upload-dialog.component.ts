import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import filesize from 'file-size';
import { getCodeOptions } from '../../../../utils';
import { DocumentManagementService } from '../../../../services/document-management.service';

export interface UploadDialogData {
    attachmentCreator: ( fileId: string, uploadPath: string, mimeType: string, description: string, category: string ) => Promise<any>;
    files: FileList
}

export interface UploadResult {
    originalFilename: string
    uploadPath: string
    contentType: string
    fileId: string
    size: number
}

interface UploadProgress {
    file: File,
    mimeType: string,
    percent: number,
    status: string,
    complete: boolean,
    cleared: boolean,
    cancelled: boolean,
    result?: UploadResult,
    error?: string
}

@Component({
    selector: 'photo-upload-dialog',
    templateUrl: 'photo-upload-dialog.component.html',
    styleUrls: [ './photo-upload-dialog.component.scss' ],
})
export class PhotoUploadDialogComponent {
    uploads: Array<UploadProgress>
    isUploading = false
    isCompleted = false
    isUploadEnabled = true
    uploadResult: UploadResult[]
    photoCategories = getCodeOptions( 'FILE_ATTACHMENT_TYPE_CODE' )
    description: string
    category: string = 'PHOTOGRAPH'

    constructor(
        private dialogRef: MatDialogRef<PhotoUploadDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: UploadDialogData,
        private documentManagementService: DocumentManagementService
    ) {
        this.uploads = Array( this.data.files.length ).fill( 0 ).map( ( p, i ) => {
            return {
                complete: false,
                cleared: false,
                cancelled: false,
                percent: 0,
                file: data.files[ i ],
                status: `Ready to upload ${ filesize( this.data.files[ i ].size ).human( 'si' ) }`,
                mimeType: this.data.files[ i ].type
            }
        } )
    }

    onUpload() {
        this.isUploading = true

        let uploads = this.uploads.map( ( p ) => {
            if ( p.cleared ) return Promise.resolve()

            return this.uploadFile( p.file, ( percent, loaded, total ) => {
                p.percent = percent
                p.status = `Uploaded ${ filesize( loaded ).human( 'si' ) } of ${ filesize( total ).human( 'si' ) }`
            } )
            .then( ( doc ) => {
                p.percent = 99
                p.status = `Creating attachment`
                return this.data.attachmentCreator( doc.fileId, doc.filePath, p.mimeType, this.description, this.category )
                    .then( () => {
                        p.percent = 100
                        p.status = `Upload of ${ filesize( p.file.size ).human( 'si' ) } complete`
                        p.result = {
                            originalFilename: p.file.name,
                            uploadPath: doc.filePath,
                            contentType: doc.mimeType,
                            fileId: doc.fileId,
                            size: doc.fileSize,
                        }
                    } )
            } )
            .catch( ( err ) => {
                p.error = JSON.stringify( err, null, '  ' )
                p.status = 'Upload failed'
            } )
            .finally( () => {
                p.complete = true
            } )
        } )

        Promise.all( uploads )
            .then( ( res ) => {
                this.uploadResult = this.uploads
                    .filter( p => !p.cancelled && !p.cleared && !p.error )
                    .map( ( p ) => p.result )
            } )
            .finally( () => {
                this.isCompleted = true
                this.isUploading = false
            } )
    }

    onClearFile( i ) {
        this.uploads[ i ].cleared = true

        if ( !this.uploads.some( p => !p.cleared ) )
            this.dialogRef.close()
    }

    onCancelFile( i ) {
        this.uploads[ i ].cancelled = true
    }

    uploadFile( file: File, progressCallback: ( percent: number, loaded: number, total: number ) => void ): Promise<any> {
        return this.documentManagementService.uploadDocument( {
            file: file,
            onProgress: progressCallback
        } )
    }
}
