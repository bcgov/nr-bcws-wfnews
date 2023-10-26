import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'mobile-sliding-drawer',
  templateUrl: './mobile-sliding-drawer.component.html',
  styleUrls: ['./mobile-sliding-drawer.component.scss']
})
export class MobileSlidingDrawerComponent {
  showPanel: boolean;

  constructor(
    protected cdr: ChangeDetectorRef,
  ) {}

  closePanel() {
    this.showPanel = false;
  }
}
