import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from "@wf1/core-ui";
import { ROFListComponent } from './components/list/rof-list.component';
import { ROFRoutes } from "./rof-route-definitions";
import { ROFDetailComponent } from "./components/detail/rof-detail.component";

const rofRoutes: Routes = [
    {
        path: ROFRoutes.LIST,
        component: ROFListComponent,
        canActivate: [AuthGuard],
    },
    {
        path: `${ROFRoutes.DETAIL}/:wildfireYear/:reportOfFireNumber`,
        component: ROFDetailComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(rofRoutes, { relativeLinkResolution: 'legacy' })
    ],
    exports: [
        RouterModule
    ]
})
export class ROFRoutingModule { }
