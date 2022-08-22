import { Component } from "@angular/core";
import { IncidentContainer } from "./incident-container.component";
import {Location, LocationStrategy, PathLocationStrategy} from "@angular/common";


@Component({
    selector: "wf-incident-container-desktop",
    template: `
        <wf-admin-incident-desktop
            [adminIncident]="adminIncident$ | async"
            [adminIncidentCause]="adminIncidentCause$ | async"
        ></wf-admin-incident-desktop>`,
    providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class IncidentContainerDesktop extends IncidentContainer{

}