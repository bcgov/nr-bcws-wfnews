import { DomSanitizer } from '@angular/platform-browser';
import { BaseComponentModel } from '../base/base.component.model';

export class PanelWildfireStageOfControlComponentModel extends BaseComponentModel {
  constructor(protected sanitizer: DomSanitizer) {
    super(sanitizer);
  }

  public clone(): PanelWildfireStageOfControlComponentModel {
    const clonedModel: PanelWildfireStageOfControlComponentModel =
      new PanelWildfireStageOfControlComponentModel(this.sanitizer);
    return clonedModel;
  }
}
