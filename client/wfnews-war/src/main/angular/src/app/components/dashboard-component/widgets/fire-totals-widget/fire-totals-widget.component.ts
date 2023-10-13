import { Component } from "@angular/core"

@Component({
  selector: 'fire-totals-widget',
  templateUrl: './fire-totals-widget.component.html',
  styleUrls: ['./fire-totals-widget.component.scss']
})
export class FireTotalsWidget {
  public startupComplete = false
  
  constructor() { }
}
