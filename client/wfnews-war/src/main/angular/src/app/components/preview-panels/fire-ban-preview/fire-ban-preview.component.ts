import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, formatDate } from '@app/utils';

@Component({
  selector: 'wfnews-fire-ban-preview',
  templateUrl: './fire-ban-preview.component.html',
  styleUrls: ['./fire-ban-preview.component.scss']
})
export class FireBanPreviewComponent {
  
  constructor(
    private router: Router
  ) {}
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

  enterFullDetail(){
    const url = this.router.serializeUrl(
      this.router.createUrlTree([ResourcesRoutes.PUBLIC_EVENT], {
        queryParams: {
          eventType: 'ban',
          eventNumber: this.data.PROT_BAP_SYSID,
          eventName: this.data.ACCESS_PROHIBITION_DESCRIPTION,
          source: [ResourcesRoutes.ACTIVEWILDFIREMAP]
        },
      }),
    );
    window.open(url, '_blank');
  }

  zoomIn(){
    
  }

  replaceCategoryDescription(description: string): string {
    if (description.includes("Category 1")) {
      return description.replace("Category 1", "Category 1 (Campfires)");
    }
    return description;
  }
  
}
