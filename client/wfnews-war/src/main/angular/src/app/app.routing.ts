import {RouterModule, Routes} from '@angular/router';
import {UnauthorizedPageComponent} from '@wf1/core-ui';
import { ActiveWildfireMapComponent } from './components/active-wildfire-map/active-wildfire-map.component';
import { WfAdminComponent } from './components/wf-admin/wf-admin.component';
import { AdminIncidentForm } from './components/admin-incident-form/admin-incident-form.component';
import { WFMapContainerComponent } from './components/wf-map-container/wf-map-container.component';
import { AdminContainerDesktop } from './containers/admin/admin-container.component.desktop';
import { ResourcesRoutes } from './utils';
import { ROLES_UI } from './shared/scopes/scopes';
import { NewsAuthGuard } from './services/util/NewsAuthGuard';
// Components
// import {ActionsPanelComponent} from './panels';

const PROFILE_SCOPES = [[ROLES_UI.GENERAL_STAFF]];

const PANEL_ROUTES: Routes = [
	// { path: '', component: ActionsPanelComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'unauthorized', component: UnauthorizedPageComponent, pathMatch: 'full', outlet: 'root' },
  { path: ResourcesRoutes.LANDING, redirectTo: ResourcesRoutes.ACTIVEWILDFIREMAP, pathMatch: 'full',},
  { path: ResourcesRoutes.ACTIVEWILDFIREMAP, component: ActiveWildfireMapComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.WILDFIRESLIST, component: WFMapContainerComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.CURRENTSTATISTICS, component: WFMapContainerComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.RESOURCES, component: WFMapContainerComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.ERROR_PAGE, component: WFMapContainerComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.ADMIN, data:{scopes: PROFILE_SCOPES}, component: AdminContainerDesktop, pathMatch: 'full',
  canActivate: [NewsAuthGuard],},
  { path: ResourcesRoutes.ADMIN_INCIDENT, component: AdminIncidentForm, pathMatch: 'full'}
];


export const ROUTING = RouterModule.forRoot(PANEL_ROUTES, { relativeLinkResolution: 'legacy' });
