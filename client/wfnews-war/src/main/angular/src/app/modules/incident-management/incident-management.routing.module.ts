import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "@wf1/core-ui";
import { IncidentListComponent } from './components';
import { IncidentDetailComponent } from "./components/detail/incident-detail.component";
import { IncidentRoutes } from "./incident-route-definitions";

const incidentRoutes: Routes = [
    {
        path: IncidentRoutes.LIST,
        component: IncidentListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: `${IncidentRoutes.DETAIL}/:wildfireYear/:incidentNumberSequence`,
        component: IncidentDetailComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(incidentRoutes, { relativeLinkResolution: 'legacy' })
    ],
    exports: [
        RouterModule
    ]
})
export class IncidentManagementRoutingModule { }
