import {BaseComponentModel} from "../base/base.component.model";
import {DomSanitizer} from "@angular/platform-browser";

export interface LandingOptions {
    employeeBadgeNumber?: number;
    myDiaryBadgeNumber?: number;
    approvalsBadgeNumber?: number;
    approvalsLastUpdate: Date;
    diaryLastUpdate: Date;
    profileLastUpdate: Date;
}

export class LandingPageComponentModel extends BaseComponentModel {
    public employeeBadgeNumber = 0;
    public myDiaryBadgeNumber = 0;
    public approvalsBadgeNumber = 0;

    public approvalsLastUpdate: Date;
    public diaryLastUpdate: Date;
    public profileLastUpdate: Date;

    constructor(protected sanitizer: DomSanitizer,
                data?: LandingOptions) {
        super(sanitizer);
        if (data) {
            this.initData(data);
        }
    }

    private initData(data: any) {
        this.approvalsLastUpdate = data.approvalsLastUpdate;
        this.profileLastUpdate = data.profileLastUpdate;
        this.diaryLastUpdate = data.diaryLastUpdate;
        this.approvalsBadgeNumber = data.approvalsBadgeNumber ? data.approvalsBadgeNumber : 0;
        this.myDiaryBadgeNumber = data.myDiaryBadgeNumber ? data.myDiaryBadgeNumber : 0;
        this.employeeBadgeNumber = data.employeeBadgeNumber ? data.employeeBadgeNumber : 0;
    }

    public clone(): LandingPageComponentModel {
        const clonedModel: LandingPageComponentModel = new LandingPageComponentModel(this.sanitizer);
        clonedModel.approvalsLastUpdate = this.approvalsLastUpdate;
        clonedModel.diaryLastUpdate = this.diaryLastUpdate;
        clonedModel.profileLastUpdate = this.profileLastUpdate;
        clonedModel.employeeBadgeNumber = this.employeeBadgeNumber;
        clonedModel.myDiaryBadgeNumber = this.myDiaryBadgeNumber;
        clonedModel.approvalsBadgeNumber = this.approvalsBadgeNumber;
        return clonedModel;
    }
}
