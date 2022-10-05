import {DomSanitizer} from "@angular/platform-browser";
import { BaseComponentModel } from "../base/base.component.model";

export class WildFiresListComponentModel extends BaseComponentModel {

    constructor(protected sanitizer: DomSanitizer) {
        super(sanitizer);

    }

    public clone(): WildFiresListComponentModel {
        let clonedModel: WildFiresListComponentModel = new WildFiresListComponentModel(this.sanitizer);
        return clonedModel;
    }
}
