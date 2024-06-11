import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, formatDate } from '@app/utils';

@Component({
  selector: 'wfnews-area-restriction-preview',
  templateUrl: './area-restriction-preview.component.html',
  styleUrls: ['./area-restriction-preview.component.scss']
})
export class AreaRestrictionPreviewComponent {

  constructor(
    private router: Router
  ) {}
  formatDate = formatDate;
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
  
  enterFullDetail(){
    const url = this.router.serializeUrl(
      this.router.createUrlTree([ResourcesRoutes.PUBLIC_EVENT], {
        queryParams: {
          eventType: 'area-restriction',
          eventNumber: this.data.PROT_RA_SYSID,
          eventName: this.data.NAME,
          source: [ResourcesRoutes.ACTIVEWILDFIREMAP]
        },
      }),
    );
    window.open(url, '_blank');
  }

  zoomIn(){

  }

}
