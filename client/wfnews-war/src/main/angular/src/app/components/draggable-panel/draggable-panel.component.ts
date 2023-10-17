import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'wfnews-draggable-panel',
  templateUrl: './draggable-panel.component.html',
  styleUrls: ['./draggable-panel.component.scss']
})

export class DraggablePanelComponent {
  resizeHeight: string = '10vh'; // Initial height of the panel
  constructor(private drag: CdkDrag) {
    // Set the maximum height of the panel when the drag starts
    this.drag.started.subscribe(() => {
      this.drag.lockAxis = 'y';
      // this.drag._dragRef._maxPosY = window.innerHeight - window.innerHeight * 0.5;
    });
  }
}
