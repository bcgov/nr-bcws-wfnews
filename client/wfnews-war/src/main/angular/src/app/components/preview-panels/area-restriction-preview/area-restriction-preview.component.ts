import { Component } from '@angular/core';

@Component({
  selector: 'wfnews-area-restriction-preview',
  templateUrl: './area-restriction-preview.component.html',
  styleUrls: ['./area-restriction-preview.component.scss']
})
export class AreaRestrictionPreviewComponent {
  public data;
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
  
  formatDate(timestamp: string | number): string {
    if (timestamp) {
      const date = new Date((typeof timestamp === 'string' ? timestamp.slice(0, 10) : timestamp));
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };

      return date.toLocaleDateString('en-US', options);
    } else return '';
  }

  enterFullDetail(){

  }

  zoomIn(){
    
  }

}
