import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedPageComponent } from '@wf1/core-ui';
import { ActiveWildfireMapComponent } from './components/active-wildfire-map/active-wildfire-map.component';
import { AdminContainerDesktop } from './containers/admin/admin-container.component.desktop';
import { ResourcesRoutes } from './utils';
import { ROLES_UI } from './shared/scopes/scopes';
import { NewsAuthGuard } from './services/util/NewsAuthGuard';
import { IncidentContainerDesktop } from './containers/incident/incident-container.component.desktop';
import { SignOutPageComponent } from './components/sign-out-page/sign-out-page.component';
import { WildfirewResourcesComponent } from './components/wildfire-resources/wf-resources.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { PublicIncidentPageComponent } from './components/public-incident-page/public-incident-page.component';
import { WildfiresListHeaderComponent } from './components/wildfires-list-header/wildfires-list-header.component';
import { CanDeactivateGuard } from './components/common/guards/unsaved-changes.guard';
import { ReportOfFirePage } from './components/report-of-fire/report-of-fire.component';
import { Dashboard } from './components/dashboard-component/dashboard.component';
import { FullDetailsComponent } from './components/full-details/full-details.component';
import { SavedComponent } from '@app/components/saved/saved.component';
import { MoreComponent } from '@app/components/more/more.component';
import { ContactWidgetDialogComponent } from './components/sticky-widget/contact-widget-dialog/contact-widget-dialog.component';
import { AddSavedLocationComponent } from '@app/components/saved/add-saved-location/add-saved-location.component';
import { SavedLocationFullDetailsComponent } from './components/saved/saved-location-full-details/saved-location-full-details.component';
import { SavedLocationWeatherDetailsComponent } from './components/saved/saved-location-weather-details/saved-location-weather-details.component';
import { PublicEventPageComponent } from '@app/components/public-event-page/public-event-page.component';
import { DeviceRedirectGuard } from '@app/services/device-redirect-guard';
// Components

const PROFILE_SCOPES = [[ROLES_UI.ADMIN, ROLES_UI.IM_ADMIN]];
const PANEL_ROUTES: Routes = [
  // { path: '', component: ActionsPanelComponent, pathMatch: 'full', canActivate: [AuthGuard] },
  {
    path: 'unauthorized',
    component: UnauthorizedPageComponent,
    pathMatch: 'full',
    outlet: 'root',
  },
  {
    path: ResourcesRoutes.LANDING,
    redirectTo: ResourcesRoutes.DASHBOARD,
    pathMatch: 'full',
  },
  { path: ResourcesRoutes.DASHBOARD, component: Dashboard, pathMatch: 'full' },
  {
    path: ResourcesRoutes.ACTIVEWILDFIREMAP,
    component: ActiveWildfireMapComponent,
    pathMatch: 'full',
  },
  {
    path: ResourcesRoutes.WILDFIRESLIST,
    component: WildfiresListHeaderComponent,
    pathMatch: 'full',
  },
  {
    path: ResourcesRoutes.RESOURCES,
    component: WildfirewResourcesComponent,
    pathMatch: 'full',
  },
  { path: ResourcesRoutes.ROF, component: ReportOfFirePage, pathMatch: 'full' },
  {
    path: ResourcesRoutes.ADMIN,
    data: { scopes: PROFILE_SCOPES },
    component: AdminContainerDesktop,
    pathMatch: 'full',
    canActivate: [NewsAuthGuard],
  },
  {
    path: ResourcesRoutes.ADMIN_INCIDENT,
    data: { scopes: PROFILE_SCOPES },
    component: IncidentContainerDesktop,
    pathMatch: 'full',
    canActivate: [NewsAuthGuard],
    canDeactivate: [CanDeactivateGuard],
  },
  {
    path: ResourcesRoutes.PUBLIC_INCIDENT,
    component: PublicIncidentPageComponent,
    pathMatch: 'full',
  },
  {
    path: ResourcesRoutes.PUBLIC_EVENT,
    component: PublicEventPageComponent,
    pathMatch: 'full',
    canActivate: [DeviceRedirectGuard],  // Apply the guard
  },
  {
    path: ResourcesRoutes.SIGN_OUT,
    component: SignOutPageComponent,
    pathMatch: 'full',
  },
  {
    path: ResourcesRoutes.ERROR_PAGE,
    component: ErrorPageComponent,
    pathMatch: 'full',
  },
  {
    path: ResourcesRoutes.FULL_DETAILS,
    component: FullDetailsComponent,
    pathMatch: 'full',
    canActivate: [DeviceRedirectGuard],  // Apply the guard
  },
  {
    path: ResourcesRoutes.WEATHER_DETAILS,
    component: SavedLocationWeatherDetailsComponent,
    pathMatch: 'full',
  },
  { path: ResourcesRoutes.SAVED, component: SavedComponent, pathMatch: 'full' },
  {
    path: ResourcesRoutes.SAVED_LOCATION,
    component: SavedLocationFullDetailsComponent,
    pathMatch: 'full',
  },
  {
    path: ResourcesRoutes.ADD_LOCATION,
    component: AddSavedLocationComponent,
    pathMatch: 'full',
  },
  { path: ResourcesRoutes.MORE, component: MoreComponent, pathMatch: 'full' },
  {
    path: ResourcesRoutes.CONTACT_US,
    component: ContactWidgetDialogComponent,
    pathMatch: 'full',
  },
];

export const ROUTING = RouterModule.forRoot(PANEL_ROUTES, {});
