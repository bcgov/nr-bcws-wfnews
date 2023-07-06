import { Component, Input } from "@angular/core";
import { NearMeItemComponentBase } from "../near-me-item/near-me-item.component";

@Component({
    selector: 'wfone-near-me-fire',
    templateUrl: './near-me-fire.component.html',
    styleUrls: ['../base/base.component.scss', '../near-me-item/near-me-item-base.component.scss']
})
export class NearMeFireComponent extends NearMeItemComponentBase {

    @Input() fireOfNoteName: string;

    stageOfControl(nearMeItem) {
        let stageOfControl = nearMeItem.stageOfControl;
        if (this.nearMeItem.fireOfNoteInd === 'true' ) {
            return "assets/images/local_fire_department.png"
        }
        switch (stageOfControl) {
            case "Out of Control":
                return "assets/images/redcircle.png"
            case "Being Held":
                return "assets/images/yellowcircle.png"
            case "Under Control":
                return "assets/images/limegreencircle.png"
            case "Declared Out":
                return "assets/images/greycircle.png"
            
                
        }
}

}

