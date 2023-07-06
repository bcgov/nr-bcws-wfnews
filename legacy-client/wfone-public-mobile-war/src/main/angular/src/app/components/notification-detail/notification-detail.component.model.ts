import {BaseComponentModel} from "../base/base.component.model";
import {DomSanitizer} from "@angular/platform-browser";


export class NotificationDetailComponentModel extends BaseComponentModel {

    constructor(protected sanitizer: DomSanitizer) {
        super(sanitizer);
    }

}

