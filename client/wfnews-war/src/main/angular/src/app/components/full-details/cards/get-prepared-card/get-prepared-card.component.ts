import { Component } from '@angular/core';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';
import { defaultSlimButtonStyle } from '@app/components/common/wfnews-button/wfnews-button.component';

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
    window.open('https://www2.gov.bc.ca/gov/content/safety/emergency-management/preparedbc/build-an-emergency-kit-and-grab-and-go-bag', '_blank');
  }

  directToDownloadPdf() {
    window.open('https://www2.gov.bc.ca/assets/download/2F048A731CC9463AB83E011FED0213A3', '_blank');
  }
}
