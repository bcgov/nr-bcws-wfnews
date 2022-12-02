import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfigService, TokenService } from "@wf1/core-ui";
import { FileDetailsRsrc, FileMetadataRsrc } from "@wf1/wfdm-document-management-api";
import { UUID } from 'angular2-uuid';
import { environment } from '../../environments/environment';

export const UPLOAD_DIRECTORY = '/WFIM/uploads'

@Injectable({
    providedIn: 'root'
})
export class DocumentManagementService {
    wfdmBaseUrl: string
    userGuid: string

    constructor(
        private appConfigService: AppConfigService,
        private tokenService: TokenService,
        private httpClient: HttpClient
    ) {
        this.tokenService.credentialsEmitter.subscribe( ( cred ) => {
            this.userGuid = cred.user_guid || cred.userGuid
        } )

        this.appConfigService.loadAppConfig().then( () => {
            this.wfdmBaseUrl = this.appConfigService.getConfig().rest[ 'wfdm' ]

            this.tokenService.authTokenEmitter.subscribe( ( token ) => {
                this.installServiceWorkerPathHandlers( token )
            } )
        } )
    }

    downloadDocument (fileId) {
      const url = `${this.makeDocumentUrl(fileId)}`
      return this.httpClient.request( new HttpRequest( 'GET', url, {
        reportProgress: true,
        responseType: 'blob'
      }))
    }

    uploadDocument( {
        file,
        fileName,
        userId = this.userGuid,
        uploadDirectory = UPLOAD_DIRECTORY,
        onProgress = () => {}
    }: {
        file: File,
        fileName?: string,
        userId?: string,
        uploadDirectory?: string,
        onProgress?: ( percent: number, loaded: number, total: number ) => void
    } ): Promise<FileDetailsRsrc> {
        if ( !fileName ) fileName = file.name

        const unique = UUID.UUID()
        const path = `${ uploadDirectory }/users/${ userId }/${ unique }--${ fileName }`

        const formData = new FormData()
        formData.append( 'resource', new Blob( [
            JSON.stringify( makeFileDetail( file.size, path, [
                makeMetadata( 'actual-filename', file.name ),
                makeMetadata( 'content-type', file.type ),
            ] ) )
        ], { type: 'application/json' } ) )

        formData.append( 'file', file )

        const url = `${ this.wfdmBaseUrl }/documents`

        let req = this.httpClient.request( new HttpRequest( 'POST', url, formData, {
            reportProgress: true,
            responseType: 'json',
        } ) )

        return new Promise( ( res, rej ) => {
            req.subscribe(
                ( ev ) => {
                    if ( ev.type == HttpEventType.UploadProgress ) {
                        onProgress( Math.round( 100 * ev.loaded / ev.total ), ev.loaded, ev.total )
                    }
                    else if ( ev.type == HttpEventType.Sent ) {
                    }
                    else if ( ev instanceof HttpResponse ) {
                        onProgress( 100, file.size, file.size )
                        res( ev.body as FileDetailsRsrc )
                    }
                },
                ( err ) => rej( err )
            )
        } )
    }

    installServiceWorkerPathHandlers( token: string ) {
        if ( environment[ 'document_management_proxy_auth_url' ] ) {
            let url = environment[ 'document_management_proxy_auth_url' ] + '/' + token
            fetch( url, {
                method: 'PUT',
                cache: 'no-cache',
                body: new FormData()
            } ).catch( console.warn )
        }
        else {
            navigator.serviceWorker.controller.postMessage( {
                type: 'token-for-path',
                id: 'wfim-uploads',
                pathPattern: new RegExp( `^${ this.wfdmBaseUrl }/documents/[0-9]+/bytes` ),
                token: token
            } )
        }
    }

    makeDocumentUrl( fileId: string ): string {
        if ( environment[ 'document_management_proxy_auth_url' ] )
            return `${ this.wfdmBaseUrl }/documents/${ fileId }/bytes`

        let proxy = this.appConfigService.getConfig().externalAppConfig['wfdmProxy'];
        return `${proxy}?documentId=${ fileId }`;
    }
}

const FileDetailsType = 'http://resources.wfdm.nrs.gov.bc.ca/fileDetails';
function makeFileDetail( fileSize: number, fileName: string, metadata: Array<FileMetadataRsrc> ): FileDetailsRsrc {
    return {
        '@type': FileDetailsType,
        type: FileDetailsType,
        // fileId: undefined,
        // parent: undefined,
        fileSize: fileSize,
        fileType: "DOCUMENT",
        filePath: fileName,
        // retention: undefined,
        security: [],
        metadata: metadata
        // fileCheckout: null,
        // lockedInd: null,
        // uploadedOnTimestamp: null
    } as FileDetailsRsrc;
}

const MetadataType =  'http://resources.wfdm.nrs.gov.bc.ca/fileMetadataResource';
function makeMetadata( name: string, value: string, etag?: string ): FileMetadataRsrc {
    return {
        '@type': MetadataType,
        type: MetadataType,
        metadataName: name,
        metadataValue: value,
        etag: etag
    } as FileMetadataRsrc
}
