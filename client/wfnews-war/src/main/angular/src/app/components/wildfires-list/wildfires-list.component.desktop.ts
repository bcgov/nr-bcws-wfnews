import { Component } from "@angular/core";
import { WildFiresListComponent } from "./wildfires-list.component";

@Component({
    selector: 'wf-list-desktop',
    templateUrl: './wildfires-list.component.desktop.html',
    styleUrls: [
      '../common/base-collection/collection.component.scss',
      './wildfires-list.component.desktop.scss']
  })

export class WildFiresListComponentDesktop extends WildFiresListComponent {
    columnsToDisplay = ["fireName", "fireNumber", "lastUpdated", "stageOfControl", "wildfireOfNote", "fireCentreName", "location", "addToWatchlist", "viewMap"];
}
