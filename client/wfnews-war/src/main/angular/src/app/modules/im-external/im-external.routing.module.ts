import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {IMContainerComponent} from './components/container/im-container.component';
import {AuthGuard} from "@wf1/core-ui";

const routes: Routes = [
  { path: 'external/:wildfireYear/:incidentNumberSequence', component: IMContainerComponent, outlet: 'root', canActivate: [AuthGuard] },
  { path: 'external', component: IMContainerComponent, outlet: 'root', canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class IMExternalRoutingModule {}

