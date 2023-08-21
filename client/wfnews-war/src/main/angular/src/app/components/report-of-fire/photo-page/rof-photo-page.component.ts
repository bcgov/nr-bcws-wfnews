import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from "@angular/core";
import { RoFPage } from "../rofPage";
import { ReportOfFire } from "../reportOfFireModel";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'rof-photo-page',
  templateUrl: './rof-photo-page.component.html',
  styleUrls: ['./rof-photo-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoFPhotoPage extends RoFPage {
  public disableNext: boolean = true;
  public image : any;
  captureUrl:any;
  isCaptured: boolean;
  images:string[] = [];
  isFullScreen: boolean = false;
  public constructor(
    private changeDetector: ChangeDetectorRef,
    private el: ElementRef) {
    super()
  }

  initialize (data: any, index: number, reportOfFire: ReportOfFire) {
    super.initialize(data, index, reportOfFire);
  }

  async takePhoto(){
    this.image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      saveToGallery: false,
      webUseInput: true,
      width: undefined
    }).then((url) => {
      this.captureUrl = url.dataUrl;
      this.isCaptured = true
      this.images.push(this.captureUrl)
      this.changeDetector.detectChanges()
      })
  }

  deleteImage(index:number) {
    if(index >= 0 && index < this.images.length) {
      this.images.splice(index,1);
    }
  }

  enterImageFullScreen(index: number) {
    if(!this.isFullScreen){
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
}
