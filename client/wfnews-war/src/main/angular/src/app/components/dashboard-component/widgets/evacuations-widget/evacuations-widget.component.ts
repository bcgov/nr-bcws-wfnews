import { Component } from "@angular/core"

@Component({
  selector: 'evacuations-widget',
  templateUrl: './evacuations-widget.component.html',
  styleUrls: ['./evacuations-widget.component.scss']
})
export class EvacuationsWidget {
  public startupComplete = false
  
  constructor() { }
}
