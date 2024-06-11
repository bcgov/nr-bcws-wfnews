import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, formatDate, hidePanel, showPanel } from '@app/utils';

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
    hidePanel('desktop-preview');
  }
  
  goBack(){
    showPanel('identify-panel-wrapper')
    hidePanel('desktop-preview');
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
