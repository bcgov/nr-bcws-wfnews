import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ResourcesRoutes } from '@app/utils';

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
