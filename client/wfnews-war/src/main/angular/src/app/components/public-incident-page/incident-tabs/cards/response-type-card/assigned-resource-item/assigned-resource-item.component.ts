import { Component, Input } from '@angular/core';

@Component({
  selector: 'assigned-resource-item',
  templateUrl: './assigned-resource-item.component.html',
  styleUrls: ['./assigned-resource-item.component.scss']
})
export class AssignedResourceItemComponent {
  @Input() iconPath: string;
  @Input() headerText: string;
  @Input() description: string;
}
