import { Component, Input } from '@angular/core';

@Component({
  selector: 'icon-info-chip',
  templateUrl: './icon-info-chip.component.html',
  styleUrls: ['./icon-info-chip.component.scss'],
})
export class IconInfoChipComponent {
  @Input() iconPath: string;
  @Input() label: string;
  @Input() componentStyle?: IconInfoChipStyle;
}

export interface IconInfoChipArgs {
  iconPath: string;
  label: string;
  componentStyle?: IconInfoChipStyle;
}

export interface IconInfoChipStyle {
  backgroundColor: string;
  border: string;
  iconColor?: string;
  labelColor: string;
  slim?: boolean;
  overrideIconMask?: boolean;
}
