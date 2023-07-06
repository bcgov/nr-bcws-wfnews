import {Component} from "@angular/core";

// Noop component is only a workaround to trigger change detection
@Component({
    template: '<div id="fakeNoop"></div>'
})
export class FakeNoopComponent {}
