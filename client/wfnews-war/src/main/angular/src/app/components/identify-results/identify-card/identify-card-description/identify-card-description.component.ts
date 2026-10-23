import { Component, Input } from '@angular/core';

/** A section under the card lines, one card line, or the text alone. */
export type DescriptionMode = 'section' | 'line' | 'plain';

/** The description text of an identify card. */
@Component({
  selector: 'wfnews-identify-card-description',
  templateUrl: './identify-card-description.component.html',
  styleUrls: ['./identify-card-description.component.scss'],
})
export class IdentifyCardDescriptionComponent {
  /** One paragraph, or more than one in a section. */
  @Input() text: string | string[];
  /** HTML from the app's constants, in place of the text. */
  @Input() html: string;
  @Input() mode: DescriptionMode = 'section';
  /** The paragraphs of a section follow each other with no gap. */
  @Input() joined = false;

  get paragraphs(): string[] {
    return Array.isArray(this.text) ? this.text : [this.text];
  }
}
