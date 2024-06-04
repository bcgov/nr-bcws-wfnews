import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';

@Component({
  selector: 'wfnews-notificatino-map',
  templateUrl: './notification-map.component.html',
  styleUrls: ['./notification-map.component.scss'],
})
export class NotificationMapComponent implements OnInit, AfterViewInit {
  @ViewChild('itemHeight') itemHeightSlider;
  map: any;
  notificationLocationMarker: any;
  xNotificationLocationMarker: any;

  radiusValue = 25;
  radiusCircle: any;
  isNotificationRadius = false;

  constructor(
    private dialogRef: MatDialogRef<NotificationMapComponent>,
    protected cdr: ChangeDetectorRef,
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
    this.loadMap();
  }

  loadMap() {
    this.map = L.map('map', {
      zoomControl: false,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        zoom: 5,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      },
    ).addTo(this.map);

    if (this.data.title === 'Choose location on the map') {
      // set notification location on map
      const markerOptions = {
        icon: L.divIcon({
          className: 'custom-icon-class',
          html: `<div class="custom-marker" style="margin-top:-24px">
                <img alt="icon" src="/assets/images/svg-icons/location_pin.svg"/>
              </div>`,
          iconSize: [32, 32],
        }),
        draggable: false,
      };

      const xMarkerOptions = {
        icon: L.divIcon({
          className: 'custom-icon-class',
          html: `<div class="custom-marker" style="text-align:center">
                <img alt="icon" src="/assets/images/svg-icons/x-icon.svg"/>
              </div>`,
          iconSize: [20, 20],
        }),
        draggable: false,
      };

      if (this.data.currentLocation && this.data.currentLocation.coords) {
        // Use current location coordinates
        const coords = this.data.currentLocation.coords;
        this.map.setView([coords.latitude, coords.longitude], 10);
        this.notificationLocationMarker = L.marker(
          [coords.latitude, coords.longitude],
          markerOptions,
        ).addTo(this.map);
        this.xNotificationLocationMarker = L.marker(
          [coords.latitude, coords.longitude],
          xMarkerOptions,
        ).addTo(this.map);
      } else {
        // location service off. Use BC center coordinates
        const bcCenter = [53.7267, -127.6476]; // Center coordinates of British Columbia
        const zoomLevel = 5;
        this.map.setView(bcCenter, zoomLevel);
        this.notificationLocationMarker = L.marker(
          bcCenter,
          markerOptions,
        ).addTo(this.map);
        this.xNotificationLocationMarker = L.marker(
          bcCenter,
          xMarkerOptions,
        ).addTo(this.map);
      }

      this.map.on('drag', (event: any) => {
        const mapCenter = this.map.getCenter();
        this.notificationLocationMarker.setLatLng(mapCenter);
        this.xNotificationLocationMarker.setLatLng(mapCenter);
      });
    } else if (this.data.title === 'Notification Radius') {
      // set radius on map
      const markerOptions = {
        icon: L.icon({
          iconUrl: '/assets/images/svg-icons/blue-white-location-icon.svg',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
        draggable: false,
      };

      const center = [this.data.lat, this.data.long]; // Center coordinates of British Columbia

      this.map.setView(center, 9);
      this.notificationLocationMarker = L.marker(center, markerOptions).addTo(
        this.map,
      );

      // Add circle around the marker
      const radius = 25000; // Set the radius in meters
      const circleOptions = {
        color: '#548ADB', // Color of the circle
        opacity: 0.9, // Opacity of the circle
        fillColor: '#548ADB', // Fill color of the circle
        fillOpacity: 0.2, // Fill opacity of the circle
      };
      this.radiusCircle = L.circle(center, {
        radius,
        ...circleOptions,
      }).addTo(this.map);
    }
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
    // Remove existing circle if present
    if (this.map.hasLayer(this.radiusCircle)) {
      this.map.removeLayer(this.radiusCircle);
    }

    // Add new circle with updated radius
    if (this.itemHeightSlider && this.itemHeightSlider.nativeElement) {
      const radius = Number(this.itemHeightSlider.nativeElement.value) * 1000; // Convert km to meters
      const circleOptions = {
        color: '#548ADB',
        opacity: 0.9,
        fillColor: '#548ADB',
        fillOpacity: 0.2,
      };

      let zoomLevel;

      switch (radius) {
        case 25000:
          zoomLevel = 9;
          break;
        case 50000:
          zoomLevel = 8;
          break;
        default:
          zoomLevel = 7;
          break;
      }

      this.map.setView(this.notificationLocationMarker.getLatLng(), zoomLevel);

      this.radiusCircle = L.circle(
        this.notificationLocationMarker.getLatLng(),
        {
          radius,
          ...circleOptions,
        },
      ).addTo(this.map);
      this.cdr.detectChanges();
    }
  }

  saveLocation() {
    const radiusValue = this.itemHeightSlider?.nativeElement.value;

    this.dialogRef.close({
      exit: true,
      location: this.notificationLocationMarker._latlng,
      radius: radiusValue ? Number(radiusValue) : undefined,
    });
  }
}
