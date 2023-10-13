import { Component } from "@angular/core"

@Component({
  selector: 'situation-widget',
  templateUrl: './situation-widget.component.html',
  styleUrls: ['./situation-widget.component.scss']
})
export class SituationWidget {
  public startupComplete = false

  constructor() { }
}
