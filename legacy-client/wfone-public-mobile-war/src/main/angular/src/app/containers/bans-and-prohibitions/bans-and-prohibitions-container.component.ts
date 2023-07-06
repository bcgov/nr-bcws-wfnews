import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";
import {selectCurrentBansProhibitions} from "../../store/bans-prohibitions/bans-prohibitions.selectors";
import {select} from "@ngrx/store";
import {VmBanProhibition} from "../../conversion/models";
import {Observable} from "rxjs";


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'bans-and-prohibitions-container',
    template: `
        <wfone-bans-and-prohibitions
                [bansProhibitions]="bansProhibitions$ | async"
        ></wfone-bans-and-prohibitions>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
// tslint:disable-next-line:component-class-suffix
export class BansAndProhibitionsContainer extends BaseContainer implements AfterViewInit {

    bansProhibitions$: Observable<VmBanProhibition[]> = this.store.pipe(select(selectCurrentBansProhibitions()));

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
