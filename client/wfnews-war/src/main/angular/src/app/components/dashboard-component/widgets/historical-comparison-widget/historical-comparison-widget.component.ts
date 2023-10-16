import { Component } from "@angular/core"

@Component({
  selector: 'historical-comparison-widget',
  templateUrl: './historical-comparison-widget.component.html',
  styleUrls: ['./historical-comparison-widget.component.scss']
})
export class HistoricalComparisonWidget {
  public startupComplete = false
  
  constructor() { }
}
