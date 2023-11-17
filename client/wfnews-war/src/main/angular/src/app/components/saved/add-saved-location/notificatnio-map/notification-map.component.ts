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

    if (this.data.currentLocation) {
      this.map.setView([this.data.currentLocation.coords.latitude,this.data.currentLocation.coords.longitude],10);
      
       // Add a draggable marker with a location_pin icon
      this.notificationLocationMarker = L.marker([this.data.currentLocation.coords.latitude,this.data.currentLocation.coords.longitude], {
        icon: L.icon({
          iconUrl: "/assets/images/svg-icons/location_pin.svg",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        }),
        draggable: false
      }).addTo(this.map);

      this.map.on('drag', (event: any) => {
        const mapCenter = this.map.getCenter();
        this.notificationLocationMarker.setLatLng(mapCenter);
        console.log(this.notificationLocationMarker._latlng)
      });

    }
  }

  close() {
    this.dialogRef.close({exit: false});
  }

  saveLocation() {
    this.dialogRef.close({exit: true});
  }  
}
