import { Component,ComponentFactoryResolver,Type,ViewChild, ViewContainerRef } from '@angular/core';
import { DraggablePanelComponent } from '../draggable-panel/draggable-panel.component';
import { WeatherPanelComponent } from '@app/components/weather/weather-panel/weather-panel.component';
import { AreaRestrictionPreviewComponent } from '@app/components/preview-panels/area-restriction-preview/area-restriction-preview.component';
import { FireBanPreviewComponent } from '@app/components/preview-panels/fire-ban-preview/fire-ban-preview.component';
import { DangerRatingPreviewComponent } from '@app/components/preview-panels/danger-rating-preview/danger-rating-preview.component';
import { ProtectedLandPreviewComponent } from '@app/components/preview-panels/protected-land-preview/protected-land-preview.component';
import { hidePanel } from '@app/utils';

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

  enterPreview(item: any) {
    switch (item.layerId) {
      case 'area-restrictions':
        this.handleAreaRestrictions(item);
        break;

      case 'bans-and-prohibitions-cat1':
      case 'bans-and-prohibitions-cat2':
      case 'bans-and-prohibitions-cat3':
        this.handleBansAndProhibitions(item);
        break;

      case 'danger-rating':
        this.handleDangerRating(item);
        break;

      case 'protected-lands-access-restrictions':
        this.handleProtectedLands(item);
        break;

      case 'weather-stations':
        this.handleWeatherStations(item);
        break;

      default:
        console.error('Unknown layerId:', item.layerId);
    }

    // Hide the identify-panel-wrapper
    hidePanel('identify-panel-wrappe')

    this.cdr.markForCheck();
  }

  handleAreaRestrictions(item: any) {
    this.handlePreview(this.componentFactoryResolver, this.areaRestrictionPanelContainer, AreaRestrictionPreviewComponent, item, 'desktop-preview');
  }

  handleBansAndProhibitions(item: any) {
    this.handlePreview(this.componentFactoryResolver, this.fireBanPanelContainer, FireBanPreviewComponent, item, 'desktop-preview');
  }

  handleDangerRating(item: any) {
    this.handlePreview(this.componentFactoryResolver, this.dangerRatingPanelContainer, DangerRatingPreviewComponent, item, 'desktop-preview');
  }

  handleProtectedLands(item: any) {
    this.handlePreview(this.componentFactoryResolver, this.protectedLandPanelContainer, ProtectedLandPreviewComponent, item, 'desktop-preview');
  }

  handleWeatherStations(item: any) {
    this.weatherPanelContainer.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(WeatherPanelComponent);
    const componentRef = this.weatherPanelContainer.createComponent(componentFactory);
    componentRef.instance.setWeatherStation(item.data);

    const panel = document.getElementsByClassName('desktop-preview').item(0) as HTMLElement;
    panel.innerHTML = '';
    panel.appendChild(componentRef.location.nativeElement);
    panel.style.display = 'block';
  }

  handlePreview(
    componentFactoryResolver: ComponentFactoryResolver,
    container: ViewContainerRef,
    component: Type<any>,
    data: any,
    previewClass: string
  ) {
    container.clear();
  
    const componentFactory = componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = container.createComponent(componentFactory);
    componentRef.instance.setContent(data);
  
    const panel = document.getElementsByClassName(previewClass).item(0) as HTMLElement;
    panel.innerHTML = '';
    panel.appendChild(componentRef.location.nativeElement);
    panel.style.display = 'block';
  }

}
