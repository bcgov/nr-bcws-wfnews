import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";
import {select} from "@ngrx/store";
import {VmAdvisory} from "../../conversion/models";
import {Observable} from "rxjs";
import {selectCurrentBansProhibitions} from "../../store/bans-prohibitions/bans-prohibitions.selectors";


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'advisories-container',
    template: `
        <wfone-advisories
                [advisories]="advisories$ | async"
        ></wfone-advisories>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
// tslint:disable-next-line:component-class-suffix
export class AdvisoriesContainer extends BaseContainer implements AfterViewInit {

    advisories$: Observable<VmAdvisory[]> = this.store.pipe(select(selectCurrentBansProhibitions()));

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
