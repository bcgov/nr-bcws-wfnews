import { Component,ViewChild, ViewContainerRef } from '@angular/core';
import { DraggablePanelComponent } from '../draggable-panel/draggable-panel.component';
import { WeatherPanelComponent } from '@app/components/weather/weather-panel/weather-panel.component';
import { AreaRestrictionPreviewComponent } from '@app/components/preview-panels/area-restriction-preview/area-restriction-preview.component';
import { FireBanPreviewComponent } from '@app/components/preview-panels/fire-ban-preview/fire-ban-preview.component';
import { DangerRatingPreviewComponent } from '@app/components/preview-panels/danger-rating-preview/danger-rating-preview.component';
import { ProtectedLandPreviewComponent } from '@app/components/preview-panels/protected-land-preview/protected-land-preview.component';

@Component({
  selector: 'wfnews-identify-panel',
  templateUrl: './identify-panel.component.html',
  styleUrls: ['./identify-panel.component.scss']
})
export class IdentifyPanel extends DraggablePanelComponent {
  @ViewChild('weatherPanelContainer', { read: ViewContainerRef }) weatherPanelContainer: ViewContainerRef;
  @ViewChild('areaRestrictionPanelContainer', { read: ViewContainerRef }) areaRestrictionPanelContainer: ViewContainerRef;
  @ViewChild('fireBanPanelContainer', { read: ViewContainerRef }) fireBanPanelContainer: ViewContainerRef;
  @ViewChild('dangerRatingPanelContainer', { read: ViewContainerRef }) dangerRatingPanelContainer: ViewContainerRef;
  @ViewChild('protectedLandPanelContainer', { read: ViewContainerRef }) protectedLandPanelContainer: ViewContainerRef;

  parseAreaRestriction(text: string) {
    text = text.replace("Area Restriction", "Restricted Area")
    return decodeURIComponent(escape(text));
  }

  enterPreview(item) {
    let componentFactory, componentRef, panel;
    switch (item.layerId) {
      case 'area-restrictions':
        this.areaRestrictionPanelContainer.clear();
  
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(AreaRestrictionPreviewComponent);
        componentRef = this.areaRestrictionPanelContainer.createComponent(componentFactory);
        componentRef.instance.setContent(item);
        
        panel = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
        panel.innerHTML = '';
        panel.appendChild(componentRef.location.nativeElement);
        panel.style.display = 'block';
        break;
      case 'bans-and-prohibitions-cat1':
      case 'bans-and-prohibitions-cat2':
      case 'bans-and-prohibitions-cat3':
        this.fireBanPanelContainer.clear();
  
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(FireBanPreviewComponent);
        componentRef = this.fireBanPanelContainer.createComponent(componentFactory);
        componentRef.instance.setContent(item);
        
        panel = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
        panel.innerHTML = '';
        panel.appendChild(componentRef.location.nativeElement);
        panel.style.display = 'block';
        break;

      case 'danger-rating':
        this.dangerRatingPanelContainer.clear();
  
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(DangerRatingPreviewComponent);
        componentRef = this.dangerRatingPanelContainer.createComponent(componentFactory);
        componentRef.instance.setContent(item);
        
        panel = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
        panel.innerHTML = '';
        panel.appendChild(componentRef.location.nativeElement);
        panel.style.display = 'block';
        break;

      case 'protected-lands-access-restrictions':
        this.protectedLandPanelContainer.clear();
  
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(ProtectedLandPreviewComponent);
        componentRef = this.protectedLandPanelContainer.createComponent(componentFactory);
        componentRef.instance.setContent(item);
        
        panel = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
        panel.innerHTML = '';
        panel.appendChild(componentRef.location.nativeElement);
        panel.style.display = 'block';
        break;

      case 'weather-stations':
        this.weatherPanelContainer.clear();
        
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(WeatherPanelComponent);
        componentRef = this.weatherPanelContainer.createComponent(componentFactory);
        
        componentRef.instance.setWeatherStation(item.data);
        
        panel = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
        panel.innerHTML = ''; // Clear existing content
        panel.appendChild(componentRef.location.nativeElement);
        panel.style.display = 'block';
        break;
  
      default:
        console.error('Unknown layerId:', item.layerId);
    }
  
    // Hide the identify-panel-wrapper
    const identifyPanelWrapper = document.getElementsByClassName('identify-panel-wrapper').item(0) as HTMLElement;
    if (identifyPanelWrapper) {
      identifyPanelWrapper.style.display = 'none';
    }
  
    this.cdr.markForCheck();
  }

}
