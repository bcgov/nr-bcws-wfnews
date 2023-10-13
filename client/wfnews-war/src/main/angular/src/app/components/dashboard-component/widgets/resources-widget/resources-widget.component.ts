import { Component } from "@angular/core"

@Component({
  selector: 'resources-widget',
  templateUrl: './resources-widget.component.html',
  styleUrls: ['./resources-widget.component.scss']
})
export class ResourcesWidget {
  public startupComplete = false
  
  constructor() { }
}
