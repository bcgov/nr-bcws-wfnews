import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WfnewsButtonVariant } from '../wfnews-button/wfnews-button.component';

@Component({
  selector: 'advisory-section',
  templateUrl: './advisory-section.component.html',
  styleUrls: ['./advisory-section.component.scss']
})
export class AdvisorySectionComponent {
  @Input() title: string;
  @Input() message: string;
  @Input() componentStyle: AdvisorySectionStyle;
  @Input() buttonArgs: AdvisoryButtonArgs;
  @Output() advisoryClicked = new EventEmitter<void>();

  handleAdvisoryClick = () => {
    this.advisoryClicked.emit();
  };
}

export interface AdvisorySectionArgs {
  title: string;
  message: string;
  componentStyle: AdvisorySectionStyle;
  buttonArgs: AdvisoryButtonArgs;
}

export interface AdvisorySectionStyle {
  backgroundColor: string;
  dividerColor: string;
  outerBorderColor: string;
  icon: {
    iconPath: string;
    iconCircleColor: string;
  };
  logo: {
    width: number;
    height: number;
    logoPath: string;
  };
};

/** The advisory button. Its rank carries the colour, so no caller sends one. */
export interface AdvisoryButtonArgs {
  iconPath: string;
  label: string;
  variant: WfnewsButtonVariant;
}
