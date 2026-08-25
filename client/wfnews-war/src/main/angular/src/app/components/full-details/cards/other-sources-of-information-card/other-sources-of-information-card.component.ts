import { Component } from '@angular/core';
import { EXTERNAL_LINKS } from '@app/constants';

@Component({
  selector: 'other-sources-of-information-card',
  templateUrl: './other-sources-of-information-card.component.html',
  styleUrls: ['./other-sources-of-information-card.component.scss']
})
export class OtherSourcesWhenYouLeaveCardComponent {
  downloadPdfUrl = EXTERNAL_LINKS.DOWNLOAD_PDF;
  preparedBCUrl = EXTERNAL_LINKS.PREPARED_BC_GUIDANCE;

}
