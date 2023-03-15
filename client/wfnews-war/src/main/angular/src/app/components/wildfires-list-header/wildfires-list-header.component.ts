import { Component } from '@angular/core';

@Component({
  selector: 'app-wildfires-list-header',
  templateUrl: './wildfires-list-header.component.html',
  styleUrls: ['./wildfires-list-header.component.scss']
})
export class WildfiresListHeaderComponent {

  openStageOfControlLink() {
    let url = "https://www2.gov.bc.ca/gov/content/safety/wildfire-status/wildfire-response/management-strategies/stages-of-control"
    window.open(url, "_blank");
  }
  
}
