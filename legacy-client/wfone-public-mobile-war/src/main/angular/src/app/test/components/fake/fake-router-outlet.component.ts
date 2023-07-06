import {Component} from "@angular/core";

// Noop component is only a workaround to trigger change detection
@Component({
    selector: 'router-outlet',
    template: '<div></div>'
})
export class FakeRouterOutletComponent {}
