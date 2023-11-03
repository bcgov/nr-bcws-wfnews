import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { Camera, CameraResultType, CameraSource, GalleryPhoto, Photo, CameraPluginPermissions } from '@capacitor/camera';
import { CommonUtilityService } from "@app/services/common-utility.service";
import { ReportOfFirePage } from "@app/components/report-of-fire/report-of-fire.component";
import { Capacitor } from "@capacitor/core";

@Component({
  selector: 'rof-photo-page',
  templateUrl: './rof-photo-page.component.html',
  styleUrls: ['./rof-photo-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFPhotoPage extends RoFPage {
  public disableNext: boolean = true;
  captureUrl:any;
  isCaptured: boolean;
  images: (Photo | GalleryPhoto)[] = [];
  isFullScreen: boolean = false;
  isEditMode: boolean = false;
  public constructor(
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef,
    private commonUtilityService: CommonUtilityService,
    private reportOfFirePage: ReportOfFirePage,
    private cdr: ChangeDetectorRef
    ) {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }

  async takePhoto(){
    // This will never have metadata and we need to also capture the location here. With the location we can either
    // add it to the image as exif using something like exif-js or attach it to the API call as a new property. That
    // might be the way to go, because even the photo gallery photos have the exif already seperated.
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      saveToGallery: false,
      webUseInput: true,
      width: undefined,
    });
    this.images.push(image);
  }

  async addFromCameraRoll() {
    const isNativePlatform = Capacitor.isNativePlatform();
    if (!isNativePlatform) {
      // This is a web browser and doesn't need anything fancy (I think).
      const photos = await Camera.pickImages({
        quality: 100,
        limit: 3 - this.images.length
      })
      photos.photos.map((image) => {
        this.images.push(image);
      })
      return;
    }

    // This is specific to iOS but should work for Android. If not we may need to check specifically for platform.
    const currentPermissions = await Camera.checkPermissions();
    if (currentPermissions?.photos === 'granted') {
      // All permissions are granted and we should be able to get everything we need
      const photos = await Camera.pickImages({
        quality: 100,
        limit: 3 - this.images.length
      })
      photos.photos.map((image) => {
        this.images.push(image);
      })
    } else if (currentPermissions?.photos == 'limited') {
      // They have a limited amount of images selected to share and only those will provide exif
      const imagesLeft = 3 - this.images.length;
      if (imagesLeft) {
        // iOS 14+ Only: Allows the user to update their limited photo library selection. On iOS 15+ returns all the
        // limited photos after the picker dismissal. On iOS 14 or if the user gave full access to the photos it returns
        // an empty array.
        const photos = await Camera.pickLimitedLibraryPhotos();
        photos.photos.slice(0, imagesLeft).map((image) => {
          this.images.push(image);
        })
      }
    }

    // The permission is denied and we need to ask for it. This is what the capacitor code should look like based on
    // documentation, but it doesn't work from my experience on iOS. If this doesn't work we may need to have a prompt
    // to explain the steps and redirect to settings like we do for location.
    try {
      const permissionStatus = await Camera.requestPermissions();
      console.log('camera permissions', permissionStatus)
    } catch (error) {
      console.log('permission error', error)
    }
    this.cdr.detectChanges();
  }

  deleteImage(index:number) {
    if(index >= 0 && index < this.images.length) {
      this.images.splice(index,1);
    }
  }

  enterImageFullScreen(index: number) {

    if(!this.isFullScreen && !this.commonUtilityService.isIPhone()){
      const imgElement = this.el.nativeElement.querySelectorAll('.imagecontainer')[index];
      if (imgElement) {
        if (imgElement.requestFullscreen) {
          imgElement.requestFullscreen();
        } else if (imgElement.mozRequestFullScreen) {
          imgElement.mozRequestFullScreen();
        } else if (imgElement.webkitRequestFullscreen) {
          imgElement.webkitRequestFullscreen();
        } else if (imgElement.msRequestFullscreen) {
          imgElement.msRequestFullscreen();
        }
      }
      this.isFullScreen = !this.isFullScreen;
    }
  }

  exitImageFullScreen(){
    if(this.isFullScreen){
      document.exitFullscreen();
      this.isFullScreen = !this.isFullScreen;
    }
  }

  confirmPhotos() {
    this.reportOfFire.image1 = this.images[0];
    this.reportOfFire.image2 = this.images[1];
    this.reportOfFire.image3 = this.images[2];
  }

  editMode() {
    this.isEditMode = true;
    this.cdr.detectChanges()
  }

  backToReview() {
    this.reportOfFirePage.edit('review-page')
  }
}
