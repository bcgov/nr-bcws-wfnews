import { Component } from "@angular/core"

@Component({
  selector: 'bans-widget',
  templateUrl: './bans-widget.component.html',
  styleUrls: ['./bans-widget.component.scss']
})
export class BansWidget {
  public startupComplete = false
  
  constructor() { }
}
