import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, Input, NgZone, OnInit, Type, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { AttachmentResource } from '@wf1/incidents-rest-api';
import { InitDetail } from 'lightgallery/lg-events';
import { LgQuery } from 'lightgallery/lgQuery';
import { LightGallery } from 'lightgallery/lightgallery';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgThumbnails from 'lightgallery/plugins/thumbnail';
import lgVideo from 'lightgallery/plugins/video';
import lgZoom from 'lightgallery/plugins/zoom';
import 'video.js';
import { download } from '../../../../download';
import { getCodeOptions } from '../../../../utils';
import { DocumentManagementService } from '../../../../services/document-management.service';
import { PhotoPropertiesComponent, Properties, PropertyAccessor } from '../photo-properties/photo-properties.component';
import { UploadResult } from '../photo-upload-dialog/photo-upload-dialog.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { SpatialUtilsService } from '@wf1/core-ui';
import filesize from 'file-size';

interface AttachmentCollection {
    title: string
    attachments: Attachment[]
    order: number
}

interface Attachment {
    type: 'image' | 'video'
    favourite: boolean
    selected: boolean
    archived: boolean
    description: string
    fullsizeLink: string
    thumbnailLink: string
    downloadLink: string
    resource: AttachmentResource
    order: number
    title: string
    fileName: string
}

export interface PhotoFilter {
    category: string
    archived: boolean
    private: boolean
}

const hiddenProperties = [ 'description', 'category', 'thumbnail', 'appAcronym' ]

@Component({
    selector: 'wfim-photo-gallery',
    templateUrl: './photo-gallery.component.html',
    styleUrls: [ './photo-gallery.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class PhotoGalleryComponent implements PropertyAccessor, OnInit, AfterViewInit {
    @Input() attachmentCreator: ( fileId: string, uploadPath: string, mimeType: string, description: string, category: string ) => Promise<any>;
    @Input() attachmentUpdater: ( att: AttachmentResource ) => Promise<AttachmentResource>;
    @Input() attachmentListUpdater: ( filter: PhotoFilter ) => Promise<AttachmentResource[]>;
    @Input() showSelection: boolean = true
    @Input() showFilter: boolean = true
    @Input() showIdentifier: boolean = false

    @ViewChild('propertiesContainer', {read: ViewContainerRef}) propertiesContainer: ViewContainerRef;

    lgSettings
    lightGallery = null
    refreshLightGallery = false
    attachmentCollections: AttachmentCollection[] = []
    attachments: Attachment[] = []
    isLoadingAttachments = false
    photoCategories = getCodeOptions( 'FILE_ATTACHMENT_TYPE_CODE' )
    filterCategory
    showArchived = false
    showPrivate = false
    isUpdatingSelection = false

    constructor(
        protected cdr: ChangeDetectorRef,
        protected documentManagementService: DocumentManagementService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected zone: NgZone,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private spatialUtils: SpatialUtilsService,
    ) {
        this.iconRegistry.addSvgIconLiteral('camera-lock', this.sanitizer.bypassSecurityTrustHtml(`
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24">
                <path d="M4 4H7L9 2H15L17 4H20C21.11 4 22 4.89 22 6V12C21.16 11.37 20.13 11 19 11C18.21 11 17.46 11.18 16.79 11.5C16.18 9.22 14.27 7 12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C12.42 17 12.84 16.95 13.23 16.85C13.08 17.2 13 17.59 13 18V20H4C2.9 20 2 19.11 2 18V6C2 4.89 2.9 4 4 4M12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9M23 18.3V21.8C23 22.4 22.4 23 21.7 23H16.2C15.6 23 15 22.4 15 21.7V18.2C15 17.6 15.6 17 16.2 17V15.5C16.2 14.1 17.6 13 19 13C20.4 13 21.8 14.1 21.8 15.5V17C22.4 17 23 17.6 23 18.3M20.5 15.5C20.5 14.7 19.8 14.2 19 14.2C18.2 14.2 17.5 14.7 17.5 15.5V17H20.5V15.5Z" />
            </svg>
        `));
    }

    ngOnInit() {
        this.loadAttachments()
    }

    ngAfterViewInit() {
        // console.log('ngAfterViewInit')

        this.lgSettings = {
            licenseKey: 'A28EDEE4-01F14A98-998D0598-D5E03886',
            counter: false,
            plugins: [
                lgZoom,
                lgThumbnails,
                lgVideo,
                lgFullscreen,
                makeProperties( this.propertiesContainer, this.componentFactoryResolver, this.zone, this ) ],
            videojs: true,
            showZoomInOutIcons: true,
            scale: 0.5,
            actualSize: false
        }
    }

    onUploadFiles( results: UploadResult[] ) {
        if ( results.length == 0 ) return

        setTimeout( () => {
            // console.log('reloading photos')
            this.loadAttachments()
        }, 1000 )
    }

    fetchProperties( index: number ): Promise<Properties> {
        let a = this.attachments[ index ]

        return Promise.resolve( {
            description: a.description,
            category: a.resource.attachmentTypeCode,
            metadata: [
                { title: 'Filename', value: extractActualFilename( a.resource.fileName ) },
                // { title: 'File size', value: filesize( a.resource. ).human( 'si' ) },
                { title: 'Content type', value: a.resource.mimeType },
                { title: 'Image size', value: a.resource.imageWidth && a.resource.imageHeight && `${ a.resource.imageWidth } x ${ a.resource.imageHeight }` },
                { title: 'Uploaded by', value: a.resource.uploadedBy },
                { title: 'Uploaded on', value: a.resource.uploadedTimestamp && ( new Date( a.resource.uploadedTimestamp ) ).toDateString() },
                { title: 'Latitude, Longitude', value: a.resource.longitude && a.resource.latitude && this.spatialUtils.formatCoordinates([a.resource.longitude, a.resource.latitude])},
                { title: 'Azimuth', value: a.resource.azimuth && `${ a.resource.azimuth }°` },
                { title: 'Elevation', value: a.resource.elevation && `${ a.resource.elevation }m` },
            ],
            resource: a.resource
        } as Properties )
    }

    saveProperties( index: number, p: Properties ): Promise<any> {
        return this.attachmentUpdater( {
            ...p.resource,
            attachmentDescription: p.description,
            attachmentTypeCode: p.category
        } )
        .then( () => {
            this.attachments[ index ].description = p.description
            this.attachments[ index ].resource.attachmentDescription = p.description
            this.attachments[ index ].resource.attachmentTypeCode = p.category
        } )
    }

    archiveAttachment( index: number, p: Properties ): Promise<any> {
        return this.attachmentUpdater( {
            ...p.resource,
            archived: true
        } )
        .then( () => {
            this.attachments[ index ].archived = true
            this.attachments[ index ].resource.archived = true
        } )
    }

    get editProperties(): boolean {
        return this.showFilter && this.showSelection
    }

    onLgInit() {
        let self = this
        return ( detail: InitDetail ) => {
            // console.log('lightgallery init')
            self.lightGallery = detail.instance

            // replace lg icons with material icons
            self.lightGallery.outer.find( 'button.lg-close' ).append( '<i class="material-icons">close</i>' )
            self.lightGallery.outer.find( 'a.lg-download' ).append( '<i class="material-icons">file_download</i>' )
            self.lightGallery.outer.find( 'button.lg-zoom-in' ).append( '<i class="material-icons">zoom_in</i>' )
            self.lightGallery.outer.find( 'button.lg-zoom-out' ).append( '<i class="material-icons">zoom_out</i>' )
            self.lightGallery.outer.find( 'button.lg-fullscreen' ).append( '<i class="material-icons">fullscreen</i>' )
            self.lightGallery.outer.find( 'button.lg-prev' ).append( '<i class="material-icons">arrow_back</i>' )
            self.lightGallery.outer.find( 'button.lg-next' ).append( '<i class="material-icons">arrow_forward</i>' )
        }
    }

    createForm() {
        this.cdr.detectChanges()

        setTimeout( () => {
            this.lightGallery.refresh()
        }, 1000 )
    }

    get attachmentStatus() {
        if ( this.isLoadingAttachments ) return 'Loading Attachments'
        if ( this.attachmentCount == 0 ) return 'No Attachments Found'
    }

    get attachmentCount() {
        return this.attachments.length
    }

    get selectedCount() {
        return this.attachments.reduce( ( acc, a ) => acc + ( a.selected ? 1 : 0 ), 0 )
    }

    loadAttachments() {
        this.isLoadingAttachments = true
        this.cdr.detectChanges()

        let filter: PhotoFilter = {
            category: this.filterCategory,
            archived: this.showArchived,
            private: this.showPrivate,
        }

        return this.attachmentListUpdater( filter ).then( ( attachments ) => {
            let dayCollection: { [key: string]: AttachmentCollection } = {}
            attachments.forEach( ( att, i ) => {
                let ts = att.createdTimestamp || att.uploadedTimestamp
                let day = ( new Date( ts ) ).toDateString()

                if ( !dayCollection[ day ] ) dayCollection[ day ] = {
                    title: day,
                    attachments: [],
                    order: ( new Date( day ) ).getTime()
                }

                let a = {
                    favourite: false,
                    selected: false,
                    archived: att.archived,
                    description: att.attachmentDescription,
                    resource: att,
                    order: Number( ts ),
                    fileName: extractActualFilename( att.fileName ),
                    title: att.attachmentTitle
                } as Attachment
                dayCollection[ day ].attachments.push( a )

                if ( !att.mimeType || att.mimeType.startsWith( 'image' ) ) {
                    a.type = 'image'
                    a.fullsizeLink = this.documentManagementService.makeDocumentUrl( att.fileIdentifier )
                    a.downloadLink = this.documentManagementService.makeDocumentUrl( att.fileIdentifier )
                    a.thumbnailLink = this.documentManagementService.makeDocumentUrl( att.thumbnailIdentifier || att.fileIdentifier )
                }
                else if ( att.mimeType.startsWith( 'video' ) ) {
                    a.type = 'video'
                    a.fullsizeLink = JSON.stringify( {
                        source: [
                            {
                                src: this.documentManagementService.makeDocumentUrl( att.fileIdentifier ),
                                type: "video/mp4"
                            }
                        ],
                        attributes: {
                            preload: false,
                            controls: true
                        }
                    } )
                    a.downloadLink = this.documentManagementService.makeDocumentUrl( att.fileIdentifier )
                    a.thumbnailLink = 'assets/images/video-placeholder.png'
                }
            } )

            this.attachmentCollections = Object.values( dayCollection ).sort( ( a, b ) => b.order - a.order )
            this.attachmentCollections.forEach( ac => ac.attachments.sort( ( a, b ) => b.order - a.order ) )

            this.attachments = this.attachmentCollections.reduce( (acc, ac) => {
                return acc.concat( ac.attachments )
            }, [] )

            this.refreshLightGallery = true
            this.createForm()
        } )
        .finally( () => {
            this.isLoadingAttachments = false
            this.cdr.detectChanges()
        } )
    }

    onSelectPhoto( i, j, event ) {
        this.attachmentCollections[ i ].attachments[ j ].selected = !this.attachmentCollections[ i ].attachments[ j ].selected
        event.stopPropagation()
    }

    onClearSelection() {
        this.attachments.forEach( a => { a.selected = false } )
    }

    onToggleFavourite() {
        // let selected = this.formGroup.value.selectedPhotos.reduce( ( pa, p, pi ) => {
        //     return p.reduce( ( qa, q, qi ) => {
        //         if ( q ) qa.push( [ pi, qi ] )
        //         return qa
        //     }, pa )
        // }, [] )

        // let state = selected.some( ( [ i, j ] ) => {
        //     return !this.photoCollections[ i ].photos[ j ].favourite
        // } )

        // selected.forEach( ( [ i, j ] ) => {
        //     this.photoCollections[ i ].photos[ j ].favourite = state
        // } )
    }

    onDownloadSelection() {
        this.attachments.forEach( a => {
            if ( !a.selected ) return

            let filename = extractActualFilename( a.resource.fileName )
            download( a.downloadLink, filename )
        } )
    }

    onFilterChanged( ev ) {
        this.loadAttachments()
    }

    onFilterReset() {
        this.filterCategory = null
        this.showArchived = false
        this.showPrivate = false
        this.loadAttachments()
    }

    onArchiveSelection( archiving: boolean ) {
        this.isUpdatingSelection = true

        let archivePromises = this.attachments.reduce( ( acc, a ) => {
            if ( !a.selected ) return acc

            return acc.concat( this.attachmentUpdater( {
                ...a.resource,
                archived: archiving
            } ) )
        }, [] )

        return Promise.all( archivePromises )
            .then( () => {
                return this.loadAttachments()
            } )
            .catch( ( err ) => {
                console.warn( 'updating selection:', err )
            } )
            .finally( () => {
                this.isUpdatingSelection = false
            } )
    }

    onPrivateSelection( privateInd: boolean ) {
        this.isUpdatingSelection = true

        let archivePromises = this.attachments.reduce( ( acc, a ) => {
            if ( !a.selected ) return acc

            return acc.concat( this.attachmentUpdater( {
                ...a.resource,
                privateIndicator: privateInd
            } ) )
        }, [] )

        return Promise.all( archivePromises )
            .then( () => {
                return this.loadAttachments()
            } )
            .catch( ( err ) => {
                console.warn( 'updating selection:', err )
            } )
            .finally( () => {
                this.isUpdatingSelection = false
            } )
    }

}


function makeProperties( propertiesContainer: ViewContainerRef, componentFactoryResolver: ComponentFactoryResolver, zone: NgZone, propertyAccessor: PropertyAccessor ) {
    return class {
        core: LightGallery
        $LG: LgQuery
        propertiesVisible: boolean = false
        componentRef: ComponentRef<any>
        slideIndex: number

        constructor( instance: LightGallery, $LG: LgQuery ) {
            // console.log('Properties constructor')
            this.core = instance;
            this.$LG = $LG;
        }

        init() {
            // console.log('Properties init')
            this.core.$toolbar.first().append( '<button id="properties" type="button" class="properties lg-icon"><i class="material-icons">info</i></button>' )

            this.core.outer.find( 'button.properties' ).first().on( 'click.lg', () => {
                if ( this.isPropertiesVisible() ) {
                    this.hideProperties()
                }
                else {
                    this.showProperties()
                }
            } )

            this.core.LGel.on( 'lgAfterSlide', ( event ) => {
                this.setSlideIndex( event.detail.index )
            } )
        }

        isPropertiesVisible() {
            return this.propertiesVisible
        }

        showProperties() {
            this.core.$container.addClass( 'property-list-active' )
            this.core.outer.find( 'button.properties' ).addClass( 'active' )
            this.core.$container.append( '<div class="property-list"></div>' )
            let el = this.core.$container.find( '.property-list' )

            zone.run( () => {
                this.makeComponent( PhotoPropertiesComponent )
                this.componentRef.instance.setPropertyAccessor( propertyAccessor )
                this.componentRef.instance.setPropertyAccessor( propertyAccessor )
                this.componentRef.instance.setSlideIndex( this.slideIndex )
                this.componentRef.instance.setCloseHandler( () => {
                    this.hideProperties()
                } )
                el.append( this.componentRef.location.nativeElement )
            } )

            this.propertiesVisible = true
        }

        setSlideIndex( i ) {
            this.slideIndex = i
            if ( this.componentRef )
                this.componentRef.instance.setSlideIndex( i )
        }

        hideProperties() {
            this.core.$container.removeClass( 'property-list-active' )
            this.core.outer.find( 'button.properties' ).removeClass( 'active' )
            this.core.$container.find( '.property-list' ).remove()
            this.componentRef.destroy()
            this.componentRef = null
            this.propertiesVisible = false
        }

        destroy() {
            // console.log('Properties destroy')
        }

        makeComponent<C>( component: Type<C>): ComponentRef<C> {
            if ( this.componentRef )
                this.componentRef.destroy()

            propertiesContainer.clear()
            this.componentRef = propertiesContainer.createComponent( componentFactoryResolver.resolveComponentFactory( component ) )

            return this.componentRef
        }
    }
}

function extractActualFilename( fn: string ): string {
    let m = fn.match( /^[-0-9a-f]{36}--(.+)$/ )
    if ( !m )return fn

    return m[ 1 ]
}