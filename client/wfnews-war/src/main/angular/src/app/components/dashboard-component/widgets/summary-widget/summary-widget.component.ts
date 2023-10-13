import { Component } from "@angular/core"

@Component({
  selector: 'summary-widget',
  templateUrl: './summary-widget.component.html',
  styleUrls: ['./summary-widget.component.scss']
})
export class SummaryWidget {
  public startupComplete = false
  
  constructor() { }
}
