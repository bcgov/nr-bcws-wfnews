import { Component, Input } from '@angular/core';

@Component({
  selector: 'summary-panel',
  templateUrl: './summary-panel.component.html',
  styleUrls: ['./summary-panel.component.scss']
})
export class SummaryPanel {
  @Input() public incident;
}
