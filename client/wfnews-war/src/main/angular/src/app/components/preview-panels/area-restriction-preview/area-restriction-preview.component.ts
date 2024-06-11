import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, formatDate, hidePanel, showPanel } from '@app/utils';

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
