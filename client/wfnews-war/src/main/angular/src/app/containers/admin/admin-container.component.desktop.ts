import { Component } from '@angular/core';
import { AdminContainer } from './admin-container.component';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';


@Component({
    selector: 'wf-admin-panel-container-desktop',
    template: `
        <wf-admin-panel-desktop
            [collection]="collection$ | async"
            [searchState]="searchState$ | async"
            [loadState]="loadState$ | async"
            [errorState]="errorState$ | async"
        ></wf-admin-panel-desktop>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class AdminContainerDesktop extends AdminContainer{

}
