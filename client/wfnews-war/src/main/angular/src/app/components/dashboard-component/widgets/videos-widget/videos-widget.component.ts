import { Component } from "@angular/core"

@Component({
  selector: 'videos-widget',
  templateUrl: './videos-widget.component.html',
  styleUrls: ['./videos-widget.component.scss']
})
export class VideosWidget {
  public startupComplete = false
  
  constructor() { }
}
