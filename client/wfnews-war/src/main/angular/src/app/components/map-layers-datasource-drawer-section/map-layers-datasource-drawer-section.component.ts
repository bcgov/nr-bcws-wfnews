import {
  AfterContentInit,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'map-layers-datasource-section',
  templateUrl: './map-layers-datasource-drawer-section.component.html',
  styleUrls: ['./map-layers-datasource-drawer-section.component.scss'],
})
export class MapLayersDataSourceDrawerSectionComponent
  implements AfterContentInit {
  @ViewChild('headerElement') headerElement: ElementRef;

  ngAfterContentInit() {
    requestAnimationFrame(() => {
      this.headerElement.nativeElement.scrollIntoView({ behavior: 'smooth' });
    });
  }
}
