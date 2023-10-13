import { Component } from "@angular/core"

@Component({
  selector: 'fire-centre-stats-widget',
  templateUrl: './fire-centre-stats-widget.component.html',
  styleUrls: ['./fire-centre-stats-widget.component.scss']
})
export class FireCentreStatsWidget {
  public startupComplete = false
  
  constructor() { }
}
