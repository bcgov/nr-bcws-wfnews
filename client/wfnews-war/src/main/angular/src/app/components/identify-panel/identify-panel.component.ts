import { Component,ComponentFactoryResolver,OnChanges,SimpleChanges,Type,ViewChild, ViewContainerRef } from '@angular/core';
import { DraggablePanelComponent } from '../draggable-panel/draggable-panel.component';
import { WeatherPanelComponent } from '@app/components/weather/weather-panel/weather-panel.component';
import { AreaRestrictionPreviewComponent } from '@app/components/preview-panels/area-restriction-preview/area-restriction-preview.component';
import { FireBanPreviewComponent } from '@app/components/preview-panels/fire-ban-preview/fire-ban-preview.component';
import { DangerRatingPreviewComponent } from '@app/components/preview-panels/danger-rating-preview/danger-rating-preview.component';
import { ProtectedLandPreviewComponent } from '@app/components/preview-panels/protected-land-preview/protected-land-preview.component';
import { WildfirePreviewComponent } from '@app/components/preview-panels/wildfire-preview/wildfire-preview.component';
import { EvacuationsPreviewComponent } from '@app/components/preview-panels/evacuations-preview/evacuations-preview.component';
import { hidePanel } from '@app/utils';
import { RoadEventsPreviewComponent } from '@app/components/preview-panels/road-events-preview/road-events-preview.component';
import { LocalAuthoritiesComponent } from '@app/components/preview-panels/local-authorities/local-authorities.component';
import { ClosedRecSitesComponent } from '@app/components/preview-panels/closed-rec-sites/closed-rec-sites.component';

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
  @ViewChild('wildfirePanelContainer', { read: ViewContainerRef }) wildfirePanelContainer: ViewContainerRef;
  @ViewChild('evacuationsPanelContainer', { read: ViewContainerRef }) evacuationsPanelContainer: ViewContainerRef;
  @ViewChild('roadEventsPanelContainer', { read: ViewContainerRef }) roadEventsPanelContainer: ViewContainerRef;
  @ViewChild('localAuthoritiesPanelContainer', { read: ViewContainerRef }) localAuthoritiesPanelContainer: ViewContainerRef;
  @ViewChild('closedRecSitesPanelContainer', { read: ViewContainerRef }) closedRecSitesPanelContainer: ViewContainerRef;

  ngOnChanges(changes: SimpleChanges) {
    if (!this.removeIdentity || (changes?.incidentRefs?.currentValue?.length > 0)) {
      this.removeIdentity = false;
      this.showPanel = false;
      this.identifyIncident = null;

      const incidentRefs = changes?.incidentRefs?.currentValue;
      if (incidentRefs) {
        this.currentIncidentRefs = incidentRefs;
        this.handleLayersSelection();
      }

      if(this.currentIncidentRefs?.length == 1) {
        this.enterPreview(this.currentIncidentRefs[0])
      }
    }
  }

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

      case 'active-wildfires-fire-of-note':
      case 'active-wildfires-out-of-control':
      case 'active-wildfires-holding':
      case 'active-wildfires-under-control':
      case 'active-wildfires-out':
      case 'fire-perimeters':
        this.handleWildfires(item)
        break;

      case 'evacuation-orders-and-alerts-wms':
        this.handleEvacs(item)
        break;
        
      case 'drive-bc-active-events':
        this.handleRoadEvents(item)
        break;
      
      case 'abms-regional-districts':
      case 'clab-indian-reserves':
      case 'abms-municipalities':
      case 'fnt-treaty-land':
        this.handleLocalAuthorities(item)
        break;

      case 'closed-recreation-sites':
        this.handleClosedRecSites(item)
        break;
           
      default:
        console.error('Unknown layerId:', item.layerId);
    }

    // Hide the identify-panel-wrapper
    hidePanel('identify-panel-wrapper')

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

  handleWildfires(item: any){
    this.handlePreview(this.componentFactoryResolver, this.wildfirePanelContainer, WildfirePreviewComponent, item, 'desktop-preview');
  }

  handleEvacs(item: any) {
    this.handlePreview(this.componentFactoryResolver, this.evacuationsPanelContainer, EvacuationsPreviewComponent, item, 'desktop-preview');
  }

  handleRoadEvents(item: any) {
    this.handlePreview(this.componentFactoryResolver, this.roadEventsPanelContainer, RoadEventsPreviewComponent, item, 'desktop-preview');
  }

  handleLocalAuthorities(item: any) {
    this.handlePreview(this.componentFactoryResolver, this.localAuthoritiesPanelContainer, LocalAuthoritiesComponent, item, 'desktop-preview');
  }

  handleClosedRecSites(item: any) {
    this.handlePreview(this.componentFactoryResolver, this.closedRecSitesPanelContainer, ClosedRecSitesComponent, item, 'desktop-preview');
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
