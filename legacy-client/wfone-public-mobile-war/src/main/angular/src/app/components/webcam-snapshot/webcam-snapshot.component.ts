import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CompassHeading } from "src/app/services/capacitor-service";
import { CommonUtilityService } from "src/app/services/common-utility.service";

export type Snapshot = { image: string, heading: CompassHeading }

@Component({
    selector: "camera-snapshot",
    templateUrl: "./webcam-snapshot.component.html",
    styleUrls: ["./webcam-snapshot.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebcamSnapshotComponent implements AfterViewInit {
    @Input() imageWidth?
    @Input() imageQuality?

    @Output() snapshot: EventEmitter<Snapshot> = new EventEmitter();
    @Output() cancelPhoto: EventEmitter<any> = new EventEmitter();


    isCaptured: boolean;
    captureUrl: any
    error

    constructor(
        private changeDetector: ChangeDetectorRef,
        protected commonUtilityService: CommonUtilityService,
    ) { }

    ngAfterViewInit() {
        this.capturePhoto();
    }

    async capturePhoto() {
        this.captureUrl = null
        this.isCaptured = false
        this.error = null

        let qual = parseFloat( this.imageQuality ) || 100,
            width = parseFloat( this.imageWidth ) || undefined

        await Camera.getPhoto({
            quality: qual,
            allowEditing: false,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Camera,
            saveToGallery: false,
            webUseInput: true,
            width: width
        })
            .then((url) => {
                this.captureUrl = 'url(' + url.dataUrl + ')'
                this.isCaptured = true
                this.changeDetector.detectChanges()
                return this.commonUtilityService.getCompassHeading()
                    .then( heading => {
                        if ( heading.error || heading.trueHeading != 0 )
                            return { image: url.dataUrl, heading }

                        return {
                            image: url.dataUrl,
                            heading: { error: 'Error: no heading available ' + JSON.stringify( heading ) }
                        }
                    })
                    .catch( ( e ) => {
                        return { image: url.dataUrl, heading: { error: e } }
                    })
            })
            .then( ( snap: Snapshot ) => {
                this.snapshot.emit( snap )
            } )
            .catch((e) => {
                this.error = e.message || e
                this.cancelPhoto.emit( this.error)
                this.changeDetector.detectChanges()
            })
    }

    onRetakePhoto() {
        this.capturePhoto()
    }
}
