import { Component } from '@angular/core';
import { DraggablePanelComponent } from '../draggable-panel/draggable-panel.component';

@Component({
  selector: 'wfnews-identify-panel',
  templateUrl: './identify-panel.component.html',
  styleUrls: ['./identify-panel.component.scss']
})
export class IdentifyPanel extends DraggablePanelComponent {

  parseAreaRestriction(text: string) {
    text = text.replace("Area Restriction", "Restricted Area")
    return decodeURIComponent(escape(text));
  }

}
