import { Component, Input } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
})
export class IconButtonComponent {
  @Input() iconPath: string;
  @Input() label: string;
  @Input() style?: IconButtonStyle = defaultIconButtonStyle;
  @Input() onClick: () => void;
}

class IconButtonStyle {
  backgroundColor: string;
  border: string;
  iconColor: string;
  labelColor: string;
}

const defaultIconButtonStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #dedede',
  iconColor: '#000000',
  labelColor: '#000000',
};
