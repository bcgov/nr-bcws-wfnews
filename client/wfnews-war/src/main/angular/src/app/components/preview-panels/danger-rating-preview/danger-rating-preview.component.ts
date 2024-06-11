import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes, formatDate, hidePanel, showPanel } from '@app/utils';

@Component({
  selector: 'wfnews-danger-rating-preview',
  templateUrl: './danger-rating-preview.component.html',
  styleUrls: ['./danger-rating-preview.component.scss']
})
export class DangerRatingPreviewComponent {

  constructor(
    private router: Router
  ) {}

  public data;
  formatDate = formatDate
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
          eventType: 'danger-rating',
          eventNumber: this.data.PROT_DR_SYSID,
          eventName: this.data.DANGER_RATING_DESC,
          source: [ResourcesRoutes.ACTIVEWILDFIREMAP]
        },
      }),
    );
    window.open(url, '_blank');
  }

  zoomIn(){
    
  }

  displayDangerRatingDes(danger) {
    switch (danger) {
      case 'Extreme':
        return 'Extremely high risk of fire starting. Forest fuels are extremely dry and the fire risk is very serious. Fires can start easily, spread rapidly, and challenge fire suppression efforts. Forest activities may be restricted.';
      case 'High':
        return 'Serious risk of fire starting. Forest fuels are very dry and extreme caution must be used.';
      case 'Moderate':
        return 'Moderate risk of fire starting. Forest fuels are dry and caution should be exercised in forested areas.';
      case 'Low':
        return 'Low risk of fire starting. Fires are unlikely to involve deeper fuel layers or larger fuels. Fire is still possible, so be prepared for conditions to change.';
      case 'Very Low':
        return 'Very low risk of fire starting.';
    }
  }
}
