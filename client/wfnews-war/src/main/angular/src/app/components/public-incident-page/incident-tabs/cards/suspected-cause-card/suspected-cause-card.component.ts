import { Component, Input } from '@angular/core';
import { CauseOptionDisclaimer } from '@app/components/admin-incident-form/incident-details-panel/incident-details-panel.constants';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';

@Component({
  selector: 'suspected-cause-card',
  templateUrl: './suspected-cause-card.component.html',
  styleUrls: ['./suspected-cause-card.component.scss']
})
export class SuspectedCauseCardComponent {

  @Input() incidentSuspectedCauseCatId: number;

  defaultSlimIconButtonStyle = defaultSlimIconButtonStyle;
  
  getCauseIcon = () => {
    const directory = 'assets/images/svg-icons/';
    switch (this.incidentSuspectedCauseCatId) {
      case 1:
        return directory + 'human.svg';
      case 2:
        return directory + 'lightning.svg';
      case 3:
        return directory + 'question.svg';
      default:
        return directory + 'question.svg';
    }
  };

  getCauseLabel = () => {
    switch (this.incidentSuspectedCauseCatId) {
      case 1:
        return 'Humans';
      case 2:
        return 'Lightning';
      case 3:
        return 'Under Investigation';
      default:
        return 'Unknown';
    }
  };

  getCauseDescription = () => {
    switch (this.incidentSuspectedCauseCatId) {
      case 1:
        return CauseOptionDisclaimer[1];
      case 2:
        return CauseOptionDisclaimer[2];
      case 3:
        return CauseOptionDisclaimer[3];
      default:
        return CauseOptionDisclaimer[0];
    }
  };
}
