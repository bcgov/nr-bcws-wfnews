import {BaseComponentModel} from "../base/base.component.model";
import {DomSanitizer} from "@angular/platform-browser";


export class LatestNewsDetailComponentModel extends BaseComponentModel {

    constructor(protected sanitizer: DomSanitizer) {
        super(sanitizer);
    }

}
