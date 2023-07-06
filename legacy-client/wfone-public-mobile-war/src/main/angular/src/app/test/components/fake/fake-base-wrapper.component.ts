import {Component, Input} from "@angular/core";
import {WFOnePublicMobileRoutes} from "../../../utils";
import {ActionItem} from "../../../components/base-wrapper/base-wrapper.component";
import {ErrorState} from "../../../store/application/application.state";

@Component({
    selector: 'base-wrapper',
    template: `<div><ng-content></ng-content></div>`
})
export class FakeBaseWrapperComponent {
    @Input() title?:string;
    @Input() backRouteQueryParams?: any;
    @Input() delegateMode: boolean;
    @Input() backRoute?: WFOnePublicMobileRoutes;
    @Input() backRouteLabel?:string = null;
    @Input() summaryString?:string = null;
    @Input() actionItems?:ActionItem[] = null;
    @Input() errorState?: ErrorState[];
    @Input() sourceTab?: string;
}
