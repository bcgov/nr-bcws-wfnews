import {RouterModule, Routes} from '@angular/router';
import {UnauthorizedPageComponent} from '@wf1/core-ui';
import { ActiveWildfireMapComponent } from './components/active-wildfire-map/active-wildfire-map.component';
import { WfAdminPanelComponent } from './components/wf-admin-panel/wf-admin-panel.component';
import { WFMapContainerComponent } from './components/wf-map-container/wf-map-container.component';
import { AdminContainerDesktop } from './containers/admin/admin-container.component.desktop';
import { ResourcesRoutes } from './utils';
// Components
// import {ActionsPanelComponent} from './panels';

const PANEL_ROUTES: Routes = [
	// { path: '', component: ActionsPanelComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  { path: 'unauthorized', component: UnauthorizedPageComponent, pathMatch: 'full', outlet: 'root' },
  { path: ResourcesRoutes.LANDING, redirectTo: ResourcesRoutes.ACTIVEWILDFIREMAP, pathMatch: 'full',},
  { path: ResourcesRoutes.ACTIVEWILDFIREMAP, component: ActiveWildfireMapComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.WILDFIRESLIST, component: WFMapContainerComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.CURRENTSTATISTICS, component: WFMapContainerComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.RESOURCES, component: WFMapContainerComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.ERROR_PAGE, component: WFMapContainerComponent, pathMatch: 'full',},
  { path: ResourcesRoutes.ADMIN, component: AdminContainerDesktop, pathMatch: 'full',},

];


export const ROUTING = RouterModule.forRoot(PANEL_ROUTES, { relativeLinkResolution: 'legacy' });
