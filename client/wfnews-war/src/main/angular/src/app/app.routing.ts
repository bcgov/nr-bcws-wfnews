import {RouterModule, Routes} from '@angular/router';
import {UnauthorizedPageComponent} from "@wf1/core-ui";
// Components
// import {ActionsPanelComponent} from './panels';

const PANEL_ROUTES: Routes = [
	// { path: '', component: ActionsPanelComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'unauthorized', component: UnauthorizedPageComponent, pathMatch: 'full', outlet: 'root' },
	{ path: '**', redirectTo: '/' }
];

export const ROUTING = RouterModule.forRoot(PANEL_ROUTES, { relativeLinkResolution: 'legacy' });
