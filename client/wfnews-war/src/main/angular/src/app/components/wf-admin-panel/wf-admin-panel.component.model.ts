import {DomSanitizer} from '@angular/platform-browser';
import { BaseComponentModel } from '../base/base.component.model';

export class WfAdminPanelComponentModel extends BaseComponentModel {

    constructor(protected sanitizer: DomSanitizer) {
        super(sanitizer);

    }

    public clone(): WfAdminPanelComponentModel {
        const clonedModel: WfAdminPanelComponentModel = new WfAdminPanelComponentModel(this.sanitizer);
        return clonedModel;
    }
}
