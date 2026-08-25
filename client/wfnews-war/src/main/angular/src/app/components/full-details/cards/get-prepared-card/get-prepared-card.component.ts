import { Component } from '@angular/core';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';
import { defaultSlimButtonStyle } from '@app/components/common/wfnews-button/wfnews-button.component';
import { EXTERNAL_LINKS } from '@app/constants';


@Component({
  selector: 'get-prepared-card',
  templateUrl: './get-prepared-card.component.html',
  styleUrls: ['./get-prepared-card.component.scss']
})
export class GetPreparedCardComponent {

  defaultSlimButtonStyle = defaultSlimButtonStyle;
  defaultSlimIconButtonStyle = defaultSlimIconButtonStyle;

  directToBuildKit() {
    // eslint-disable-next-line max-len
    window.open(EXTERNAL_LINKS.EMERGENCY_KIT, '_blank');
  }

  directToDownloadPdf() {
    window.open(EXTERNAL_LINKS.DOWNLOAD_PDF, '_blank');
  }
}
