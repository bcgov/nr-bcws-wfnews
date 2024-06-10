import { Component, OnInit } from '@angular/core';
import { DraggablePanelComponent } from '../draggable-panel/draggable-panel.component';

@Component({
  selector: 'wfnews-identify-panel',
  templateUrl: './identify-panel.component.html',
  styleUrls: ['./identify-panel.component.scss']
})
export class IdentifyPanel extends DraggablePanelComponent implements OnInit {

  ngOnInit(): void {
    // const smkPanel = document
    //   .getElementsByClassName('smk-sidepanel smk-expand-1')
    //   .item(0) as HTMLElement;
    // if (smkPanel) {
    //   smkPanel.style.display = 'none';
    // }
  }

  parseAreaRestriction(text: string) {
    text = text.replace("Area Restriction", "Restricted Area")
    return decodeURIComponent(escape(text));
  }

}
