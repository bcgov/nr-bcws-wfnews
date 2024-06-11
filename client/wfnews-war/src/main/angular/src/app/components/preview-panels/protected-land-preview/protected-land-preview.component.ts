import { formatDate } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'wfnews-protected-land-preview',
  templateUrl: './protected-land-preview.component.html',
  styleUrls: ['./protected-land-preview.component.scss']
})
export class ProtectedLandPreviewComponent {
  public data;
  formatDate = formatDate;
  setContent(data) {
    this.data = data.properties;
  }
  

  closePanel() {  
    const desktopPreview = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
    if (desktopPreview) {
      desktopPreview.style.display = 'none';
    }
    const identifyPanelWrapper = document.getElementsByClassName('identify-panel-wrapper').item(0) as HTMLElement;
    if (identifyPanelWrapper) {
      identifyPanelWrapper.style.display = 'block';
    }

  }
  goBack(){
    (
      document.getElementsByClassName('identify-panel-wrapper').item(0) as HTMLElement
    ).style.display = 'block';
    (
      document.getElementsByClassName('desktop-preview').item(0) as HTMLElement
    ).style.display = 'none';
  }
  
}
