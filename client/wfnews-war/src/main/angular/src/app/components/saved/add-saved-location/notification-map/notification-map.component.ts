import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MapConfigService } from '@app/services/map-config.service';
import * as turf from '@turf/turf';

@Component({
  selector: 'wfnews-notificatino-map',
  templateUrl: './notification-map.component.html',
  styleUrls: ['./notification-map.component.scss'],
})
export class NotificationMapComponent implements OnInit, AfterViewInit {
  @ViewChild('itemHeight') itemHeightSlider;
  map: any;
  smk: any;
  mapConfig = null;
  /** The chosen point, in [ lon, lat ]. The markers follow it. */
  private picked: number[] = null;

  radiusValue = 25;
  isNotificationRadius = false;

  constructor(
    private dialogRef: MatDialogRef<NotificationMapComponent>,
    protected cdr: ChangeDetectorRef,
    private mapConfigService: MapConfigService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    if (data.title === 'Notification Radius') {
      this.isNotificationRadius = true;
    }
  }

  ngOnInit(): void {
    // this.loadMap()
  }

  ngAfterViewInit(): void {
    this.mapConfigService.getPreviewMapConfig().then((cfg) => {
      this.mapConfig = [cfg];
      this.cdr.detectChanges();
    });
  }

  initMap(smk: any) {
    this.smk = smk;
    this.map = smk.$viewer.map;

    if (this.data.title === 'Choose location on the map') {
      const coords = this.data.currentLocation?.coords;
      this.picked = coords
        ? [Number(coords.longitude), Number(coords.latitude)]
        : [-127.6476, 53.7267]; // centre of BC, when location is off

      this.map.jumpTo({ center: this.picked, zoom: coords ? 10 : 5 });
      this.drawPicker();

      // The pin marks the centre, so it follows the map rather than the pointer.
      this.map.on('move', () => {
        const c = this.map.getCenter();
        this.picked = [c.lng, c.lat];
        this.drawPicker();
      });
    } else if (this.data.title === 'Notification Radius') {
      this.picked = [Number(this.data.long), Number(this.data.lat)];
      this.map.jumpTo({ center: this.picked, zoom: 9 });
      this.drawPin();
      this.drawRadius(25000);
    }
  }

  /** The centre pin and its x, as one acetate each. */
  private drawPicker() {
    this.drawPin('/assets/images/svg-icons/location_pin.svg', 32, -24);
    this.smk.showFeature(
      'notification-x',
      { type: 'Point', coordinates: this.picked },
      { htmlMarker: () => iconElement('/assets/images/svg-icons/x-icon.svg', 20) },
    );
  }

  private drawPin(src = '/assets/images/svg-icons/blue-white-location-icon.svg',
                  size = 32, offsetY = 0) {
    this.smk.showFeature(
      'notification-location',
      { type: 'Point', coordinates: this.picked },
      { htmlMarker: () => iconElement(src, size, offsetY) },
    );
  }

  private drawRadius(radiusMetres: number) {
    this.smk.showFeature(
      'notification-radius',
      turf.circle(this.picked, radiusMetres / 1000, {
        steps: 64,
        units: 'kilometers',
      }),
      {
        paint: {
          'fill-color': '#548ADB',
          'fill-opacity': 0.2,
          'fill-outline-color': '#548ADB',
        },
      },
    );
  }

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }

  close() {
    this.dialogRef.close({ exit: false });
  }

  updateRadius(event) {
    if (!this.itemHeightSlider?.nativeElement || !this.smk) {
      return;
    }

    const radius = Number(this.itemHeightSlider.nativeElement.value) * 1000;
    const zoomLevel = radius === 25000 ? 9 : radius === 50000 ? 8 : 7;

    this.map.jumpTo({ center: this.picked, zoom: zoomLevel });
    this.drawRadius(radius);
    this.cdr.detectChanges();
  }

  saveLocation() {
    const radiusValue = this.itemHeightSlider?.nativeElement.value;

    this.dialogRef.close({
      exit: true,
      location: { lat: this.picked[1], lng: this.picked[0] },
      radius: radiusValue ? Number(radiusValue) : undefined,
    });
  }
}

/** A MapLibre marker takes a DOM element, which is what a Leaflet icon gave us. */
function iconElement(src: string, size: number, offsetY = 0): HTMLElement {
  const el = document.createElement('div');
  el.className = 'custom-icon-class';
  const img = document.createElement('img');
  img.alt = 'icon';
  img.src = src;
  img.width = size;
  img.height = size;
  el.appendChild(img);
  if (offsetY) {
    el.style.marginTop = offsetY + 'px';
  }
  el.style.pointerEvents = 'none';
  return el;
}
