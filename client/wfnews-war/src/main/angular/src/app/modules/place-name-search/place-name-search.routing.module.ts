import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "@wf1/core-ui";
// Components
import {PlaceNameSearchRoutes} from "./place-name-search-route-definitions";
import {PlaceNameSearchComponent} from "./components/search/place-name-search.component";

const placeNameSearchRoutes: Routes = [
	{ path: PlaceNameSearchRoutes.SEARCH, component: PlaceNameSearchComponent, canActivate: [AuthGuard], data: { shouldDetach: true}},
];

@NgModule({
	imports: [
		RouterModule.forRoot(placeNameSearchRoutes, { relativeLinkResolution: 'legacy' })
	],
	exports: [
		RouterModule
	]
})
export class PlaceNameSearchRoutingModule {}
