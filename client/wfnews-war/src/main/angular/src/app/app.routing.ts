import {RouterModule, Routes} from '@angular/router';
import {UnauthorizedPageComponent} from '@wf1/core-ui';
import { ActiveWildfireMapComponent } from './components/active-wildfire-map/active-wildfire-map.component';
import { AdminContainerDesktop } from './containers/admin/admin-container.component.desktop';
import { ResourcesRoutes } from './utils';
import { ROLES_UI } from './shared/scopes/scopes';
import { NewsAuthGuard } from './services/util/NewsAuthGuard';
import { IncidentContainerDesktop } from './containers/incident/incident-container.component.desktop';
import { SignOutPageComponent } from './components/sign-out-page/sign-out-page.component';
import { WildfirewResourcesComponent } from './components/wildfire-resources/wf-resources.component';
import { WFStatsComponent } from './components/wf-stats-component/wf-stats.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { PublicIncidentPage } from './components/public-incident-page/public-incident-page.component';
import { WildfiresListHeaderComponent } from './components/wildfires-list-header/wildfires-list-header.component';
// Components

const PROFILE_SCOPES = [[ROLES_UI.ADMIN, ROLES_UI.IM_ADMIN]];

const PANEL_ROUTES: Routes = [
	// { path: '', component: ActionsPanelComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'unauthorized', component: UnauthorizedPageComponent, pathMatch: 'full', outlet: 'root' },
  { path: ResourcesRoutes.LANDING, redirectTo: ResourcesRoutes.ACTIVEWILDFIREMAP, pathMatch: 'full',},
  { path: ResourcesRoutes.ACTIVEWILDFIREMAP, component: ActiveWildfireMapComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.WILDFIRESLIST, component: WildfiresListHeaderComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.CURRENTSTATISTICS, component: WFStatsComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.RESOURCES, component: WildfirewResourcesComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.ADMIN, data:{scopes: PROFILE_SCOPES}, component: AdminContainerDesktop, pathMatch: 'full', canActivate: [NewsAuthGuard],},
  { path: ResourcesRoutes.ADMIN_INCIDENT, data:{scopes: PROFILE_SCOPES}, component: IncidentContainerDesktop, pathMatch: 'full', canActivate: [NewsAuthGuard],},
  { path: ResourcesRoutes.PUBLIC_INCIDENT, component: PublicIncidentPage, pathMatch: 'full'},
  { path: ResourcesRoutes.SIGN_OUT, component: SignOutPageComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.ERROR_PAGE, component: ErrorPageComponent, pathMatch: 'full',}
];


export const ROUTING = RouterModule.forRoot(PANEL_ROUTES, { relativeLinkResolution: 'legacy' });
