import { Component } from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { WildfiresListContainer } from './wildfiresList-container.component';


@Component({
    selector: 'wf-list-container-desktop',
    template: `
        <wf-list-desktop
            [collection]="collection$ | async"
            [searchState]="searchState$ | async"
            [loadState]="loadState$ | async"
            [errorState]="errorState$ | async"
        ></wf-list-desktop>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class WildfiresListContainerDesktop extends WildfiresListContainer{

}
