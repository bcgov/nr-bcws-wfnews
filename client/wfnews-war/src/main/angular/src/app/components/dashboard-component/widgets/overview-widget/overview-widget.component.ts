import { Component } from "@angular/core"

@Component({
  selector: 'overview-widget',
  templateUrl: './overview-widget.component.html',
  styleUrls: ['./overview-widget.component.scss']
})
export class OverviewWidget {
  public startupComplete = false
  
  constructor() { }
}
