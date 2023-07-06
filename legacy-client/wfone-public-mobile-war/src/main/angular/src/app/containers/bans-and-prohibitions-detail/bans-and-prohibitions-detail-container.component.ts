import {BaseContainer} from "../base/base-container.component";
import {AfterViewInit, Component} from "@angular/core";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'bans-and-prohibitions-detail-container',
    template: `
        <wfone-bans-and-prohibitions-detail></wfone-bans-and-prohibitions-detail>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
// tslint:disable-next-line:component-class-suffix
export class BansAndProhibitionsDetailContainer extends BaseContainer implements AfterViewInit {

    // bansProhibitions$: Observable<VmBanProhibition[]> = this.store.pipe(select(selectCurrentBansProhibitions()));

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnInit() {
    }

    ngAfterViewInit(): void {

    }
}
