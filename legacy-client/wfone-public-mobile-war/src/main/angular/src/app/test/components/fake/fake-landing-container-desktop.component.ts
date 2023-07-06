import {Component, Input} from "@angular/core";
import {Observable} from "rxjs";
import {Profile} from "../../../store/common/common.state";
import {ErrorState, LoadState} from "../../../store/application/application.state";

@Component({
    selector: 'wfone-landing-page-container-desktop',
    template: '<div></div>'
})
export class LandingPageContainer {
    @Input() profile: vmProfile;

    profile$: Observable<Profile>;
    profileLoadState$: Observable<LoadState>;
    profileErrorState$: Observable<ErrorState[]>;

    constructor() {
    }

}



