import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "@wf1/core-ui";

import { NROFRoutes } from "./nrof-route-definitions";
import { NROFDetailComponent } from "./components/detail/nrof-detail.component";
import { NROFListComponent } from "./components/list/nrof-list.component";

const nrofRoutes: Routes = [
    {
        path: NROFRoutes.LIST,
        component: NROFListComponent,
        canActivate: [AuthGuard],
    },
    {
        path: `${NROFRoutes.DETAIL}/:provisionalZoneGuid`,
        component: NROFDetailComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(nrofRoutes, { relativeLinkResolution: 'legacy' })
    ],
    exports: [
        RouterModule
    ]
})
export class NROFRoutingModule { }
