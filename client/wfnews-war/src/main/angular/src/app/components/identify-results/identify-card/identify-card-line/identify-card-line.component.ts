import { Component, Input } from '@angular/core';

/** One line of an identify card: an icon, then the text. */
@Component({
  selector: 'wfnews-identify-card-line',
  templateUrl: './identify-card-line.component.html',
  styleUrls: ['./identify-card-line.component.scss'],
})
export class IdentifyCardLineComponent {
  /** A file in assets/images/svg-icons, without ".svg". */
  @Input() icon: string;
  @Input() iconAlt = 'icon';
  /** CSS draws the icon at 16px, but these img attributes stop it shrinking in a narrow line. */
  @Input() iconSize: number;
  /** A stage of control dot, by its class from getStageOfControlIcon. */
  @Input() stage: string;
}
