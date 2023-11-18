import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet'


@Component({
  selector: 'wfnews-notificatino-map',
  templateUrl: './notification-map.component.html',
  styleUrls: ['./notification-map.component.scss']
})
export class notificatinoMapComponent implements OnInit, AfterViewInit  {
  map: any;
  notificationLocationMarker: any;


  constructor(private dialogRef: MatDialogRef<notificatinoMapComponent>, @Inject(MAT_DIALOG_DATA) public data)
  { }

  ngOnInit(): void {
      // this.loadMap()
  }

  ngAfterViewInit(): void {
    this.loadMap()
  }
  
  loadMap() {
    
    this.map = L.map('map',{
      zoomControl: false,
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      zoom: 5,
      subdomains:['mt0','mt1','mt2','mt3']
    }).addTo(this.map);

    if (this.data.title === 'Choose location on the map') {
      // set notification location on map
      const markerOptions = {
        icon: L.icon({
          iconUrl: "/assets/images/svg-icons/location_pin.svg",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
        draggable: false
      };
      
      if (this.data.currentLocation && this.data.currentLocation.coords) {
        // Use current location coordinates
        const coords = this.data.currentLocation.coords;
        this.map.setView([coords.latitude, coords.longitude], 10);
        this.notificationLocationMarker = L.marker([coords.latitude, coords.longitude], markerOptions).addTo(this.map);
      } else {
        // location service off. Use BC center coordinates
        const bcCenter = [53.7267, -127.6476]; // Center coordinates of British Columbia
        const zoomLevel = 5;
        this.map.setView(bcCenter, zoomLevel);
        this.notificationLocationMarker = L.marker(bcCenter, markerOptions).addTo(this.map);
      }

      this.map.on('drag', (event: any) => {
        const mapCenter = this.map.getCenter();
        this.notificationLocationMarker.setLatLng(mapCenter);
        console.log(this.notificationLocationMarker._latlng)
      });
    }

    else if (this.data.title === 'Notification Radius') {
      // set radius on map
      const markerOptions = {
        icon: L.icon({
          iconUrl: "/assets/images/svg-icons/location_pin_radius.svg",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
        draggable: false
      };
    }
  }

  close() {
    this.dialogRef.close({exit: false});
  }

  saveLocation() {
    this.dialogRef.close({exit: true, location:this.notificationLocationMarker._latlng});
  }  
}
