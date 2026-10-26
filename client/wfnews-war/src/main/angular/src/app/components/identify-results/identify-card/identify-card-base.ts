import { Directive, HostBinding, Input } from '@angular/core';
import { IDENTIFY_TEXTS } from '@app/constants';
import { convertToDateYear, formatDate } from '@app/utils';
import { IDENTIFY_VARIANTS, IdentifyLayout } from '../identify-variants';
import { DescriptionMode } from './identify-card-description/identify-card-description.component';

/** What the card of each record type shares. */
@Directive()
export abstract class IdentifyCardBase {
  @Input() item: any;
  @Input() layout: IdentifyLayout = 'phone';

  // No box of its own, so the card frame is a flex item of the panel.
  @HostBinding('style.display') readonly display = 'contents';

  readonly texts = IDENTIFY_TEXTS;
  readonly convertToDateYear = convertToDateYear;
  readonly formatDate = formatDate;

  /** On desktop, the description is a card line and the card keeps a bottom margin. */
  protected readonly compactOnDesktop: boolean = false;

  get phone(): boolean {
    return this.layout === 'phone';
  }

  get variant() {
    return IDENTIFY_VARIANTS[this.layout];
  }

  get p(): any {
    return this.item?.properties ?? {};
  }

  get compact(): boolean {
    return !this.phone && this.compactOnDesktop;
  }

  get descriptionMode(): DescriptionMode {
    return this.compact ? 'line' : 'section';
  }
}
