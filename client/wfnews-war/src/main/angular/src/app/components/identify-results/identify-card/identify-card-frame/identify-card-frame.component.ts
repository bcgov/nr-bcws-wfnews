import { Component, HostBinding, Input } from '@angular/core';
import { IdentifyLayout } from '../../identify-variants';

/** The box of an identify card, with its title. */
@Component({
  selector: 'wfnews-identify-card-frame',
  templateUrl: './identify-card-frame.component.html',
  styleUrls: ['./identify-card-frame.component.scss'],
  host: { class: 'identify-card' },
})
export class IdentifyCardFrameComponent {
  @Input() layout: IdentifyLayout = 'phone';
  @HostBinding('class.compact') @Input() compact = false;
  /** Null leaves the title out. An empty value still draws the title line. */
  @Input() heading: string | null = null;

  @HostBinding('class.phone') get phone(): boolean {
    return this.layout === 'phone';
  }

  @HostBinding('class.desktop') get desktop(): boolean {
    return this.layout === 'desktop';
  }
}
