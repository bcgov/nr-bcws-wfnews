import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "@wf1/core-ui";
// Components
import {PointIdRoutes} from "./point-id-route-definitions";
import {PointIdPanelComponent} from "./components/point-id-panel/point-id-panel.component";

const pointIdRoutes: Routes = [
  { path: PointIdRoutes.POINT_ID, component: PointIdPanelComponent, canActivate: [AuthGuard], data: { shouldDetach: true} },
];

@NgModule({
  imports: [
    RouterModule.forRoot(pointIdRoutes, { relativeLinkResolution: 'legacy' })
  ],
  exports: [
    RouterModule
  ]
})
export class PointIdRoutingModule {}
