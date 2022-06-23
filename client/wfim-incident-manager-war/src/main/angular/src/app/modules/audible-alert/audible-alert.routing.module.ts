import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "@wf1/core-ui";
import {AudibleAlertRoutes} from "./audible-alert-route-definitions";
import {AudibleAlertComponent} from "./components/audible-alert-settings/audible-alert.component";

const audibleAlertRoutes: Routes = [
	{
        path: AudibleAlertRoutes.AUDIBLE_ALERT,
        component: AudibleAlertComponent,
        canActivate: [AuthGuard],
    },
];

@NgModule({
	imports: [
		RouterModule.forRoot(audibleAlertRoutes, { relativeLinkResolution: 'legacy' })
	],
	exports: [
		RouterModule
	]
})
export class AudibleAlertRoutingModule {}
