import { Component, Input } from '@angular/core';
import { defaultSlimIconButtonStyle } from '@app/components/common/icon-button/icon-button.component';
import { getStageOfControlDescription } from '@app/utils';
import { getStageOfControlIconPath, getStageOfControlLabel } from '../../../../../utils/index';

@Component({
  selector: 'stage-of-control-card',
  templateUrl: './stage-of-control-card.component.html',
  styleUrls: ['./stage-of-control-card.component.scss']
})
export class StageOfControlCardComponent {

  @Input() isFireOfNote: boolean;
  @Input() stageOfControlCode: string;

  defaultSlimIconButtonStyle = defaultSlimIconButtonStyle;
  getStageOfControlDescription = getStageOfControlDescription;
  getStageOfControlIconPath = getStageOfControlIconPath;
  getStageOfControlLabel = getStageOfControlLabel;

  getDescription = () => this.getStageOfControlDescription(this.stageOfControlCode);
  getIcon = () => this.getStageOfControlIconPath(this.stageOfControlCode);
  getLabel = () => this.getStageOfControlLabel(this.stageOfControlCode);
}
