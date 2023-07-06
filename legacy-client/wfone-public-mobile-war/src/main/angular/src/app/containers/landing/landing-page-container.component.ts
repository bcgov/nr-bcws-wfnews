import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";
import {Observable} from "rxjs";
import {select} from "@ngrx/store";
import {selectCurrentBackRoute, selectCurrentNearMeHighlight,} from "../../store/application/application.selectors";
import {NearMeItem} from "../../services/point-id.service";


@Component({
    selector: 'wfone-landing-page-container',
    template: `
        <wfone-landing-page
                [nearMeHighlight]="nearMeHighlight$ | async"
                [source]="source$ | async"
        ></wfone-landing-page>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class LandingPageContainer extends BaseContainer implements AfterViewInit{
    nearMeHighlight$: Observable<NearMeItem> = this.store.pipe(select(selectCurrentNearMeHighlight()));
    source$: Observable<string> = this.store.pipe(select(selectCurrentBackRoute()));

    ngOnInit() {
        //this.store.dispatch(loadCurrentProfile());
    }

    ngAfterViewInit(): void {
        

    }
}
