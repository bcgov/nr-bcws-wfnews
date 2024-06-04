import { Component, Input } from '@angular/core';
import { IconButtonArgs } from '../icon-button/icon-button.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'advisory-section',
  templateUrl: './advisory-section.component.html',
  styleUrls: ['./advisory-section.component.scss']
})
export class AdvisorySectionComponent {
  @Input() logoPath: string;
  @Input() iconPath: string;
  @Input() title: string;
  @Input() message: string;
  @Input() componentStyle: AdvisorySectionStyle;
  @Input() buttonArgs: IconButtonArgs;
}

export interface AdvisorySectionArgs {
  logoPath: string;
  iconPath: string;
  title: string;
  message: string;
  componentStyle: AdvisorySectionStyle;
  buttonArgs: IconButtonArgs;
}

interface AdvisorySectionStyle {
  backgroundColor: string;
  dividerColor: string;
  iconCircleColor: string;
  outerBorderColor: string;
};
