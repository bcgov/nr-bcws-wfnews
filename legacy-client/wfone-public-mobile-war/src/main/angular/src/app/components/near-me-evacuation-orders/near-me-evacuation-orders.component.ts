import { Component } from "@angular/core";
import { NearMeItemComponentBase } from "../near-me-item/near-me-item.component";

@Component({
    selector: 'wfone-near-me-evacuation-orders',
    templateUrl: './near-me-evacuation-orders.component.html',
    styleUrls: ['../base/base.component.scss', '../near-me-item/near-me-item-base.component.scss']
})
export class NearMeEvacuationOrdersComponent extends NearMeItemComponentBase {
}
