import { Component, Input } from '@angular/core';

@Component({
  selector: 'warning-banner',
  templateUrl: './warning-banner.component.html',
  styleUrls: ['./warning-banner.component.scss'],
})
export class WarningBannerComponent {
  @Input() iconPath: string;
  @Input() label: string;
  @Input() componentStyle?: WarningBannerStyle;
}

export interface WarningBannerArgs {
  iconPath: string;
  label: string;
  componentStyle?: WarningBannerStyle;
}

interface WarningBannerStyle {
  backgroundColor: string;
  border: string;
  iconColor?: string;
  labelColor: string;
  overrideIconMask?: boolean;
}
