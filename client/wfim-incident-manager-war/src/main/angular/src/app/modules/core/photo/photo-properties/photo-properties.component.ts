import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AttachmentResource } from '@wf1/incidents-rest-api';
import { getCodeOptions } from '../../../../utils';

export interface Properties {
    description: string
    category: string
    metadata: {
        title: string,
        value: string,
    }[],
    resource: AttachmentResource
}

export interface PropertyAccessor {
    fetchProperties( index: number ): Promise<Properties>
    saveProperties( index: number, p: Properties ): Promise<any>
    archiveAttachment( index: number, p: Properties ): Promise<any>
    editProperties: boolean
}

@Component({
    selector: 'wfim-photos-panel-properties',
    templateUrl: 'photo-properties.component.html',
    styleUrls: [ 'photo-properties.component.scss' ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoPropertiesComponent {
    properties: Properties = {
        description: '',
        category: '',
        metadata: [],
        resource: undefined
    }
    accessor: PropertyAccessor
    onCloseHandler: () => void
    slideIndex: number = 0
    hasChanged = false
    isUpdating = false
    photoCategories = getCodeOptions( 'FILE_ATTACHMENT_TYPE_CODE' )

    constructor(
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    setPropertyAccessor( p: PropertyAccessor ) {
        this.accessor = p
    }

    setSlideIndex( i ) {
        this.slideIndex = i
        this.accessor.fetchProperties( i )
            .then( p => this.properties = p )
            .catch( err => console.warn( 'failed fetching properties:', err ) )
            .finally( () => { this.changeDetectorRef.detectChanges() } )
    }

    setCloseHandler( onClose: () => void ) {
        this.onCloseHandler = onClose
    }

    get slideTitle() {
        return `Info`
    }

    get allowEdit() {
        return this.accessor.editProperties
    }

    onChanged( ev ) {
        this.hasChanged = true
    }

    onUpdate() {
        this.isUpdating = true
        this.changeDetectorRef.detectChanges()
        this.accessor.saveProperties( this.slideIndex, this.properties )
            .then( () => {
                this.hasChanged = false
            } )
            .catch( err => console.warn( 'failed updating attachment:', err ) )
            .finally( () => {
                this.isUpdating = false
                this.changeDetectorRef.detectChanges()
            } )
    }

    onArchive() {

    }

    onClose() {
        if ( this.onCloseHandler ) this.onCloseHandler()
    }
}
