import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { CommonUtilityService } from "@app/services/common-utility.service";
import { ReportOfFirePage } from "@app/components/report-of-fire/report-of-fire.component";

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
  images: Photo[] = [];
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
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      saveToGallery: false,
      webUseInput: true,
      width: undefined,
    }).then((url) => {
      const img: Photo = {
        format: "",
        saved: false
      }
      img.webPath = url.dataUrl;
      img.format = url.format;
      
      this.images.push(img)
      this.changeDetector.detectChanges()
      })
  }

  async addFromCameraRoll() {
    const photos = await Camera.pickImages({
      quality: 100,
      limit: 3 - this.images.length
    }).then((url) =>{
      if(url.photos) {
        url.photos = url.photos.splice(0,3-this.images.length)
        url.photos.forEach(photo => {
          const img: Photo = {
            format: "",
            saved: false
          }
          img.webPath = photo.webPath;
          img.format = photo.format;
          this.images.push(img)
          this.changeDetector.detectChanges()
        });
      }
    })
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

  previousPage() {
    this.checkOnline().then((result) => {
      if(!result) {
        this.reportOfFirePage.selectPage('distance-page',null,false);
        this.reportOfFirePage.currentStep--;
      } else {
        this.previous();
      }
    })
  }

  async checkOnline() {
    try {
      await this.commonUtilityService.pingSerivce().toPromise();
      this.cdr.detectChanges();
      return true;
    } catch (error) {
      this.cdr.detectChanges();
      return false;
    }
  }
}
