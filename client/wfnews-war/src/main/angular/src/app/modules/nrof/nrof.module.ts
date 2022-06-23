import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { ScrollingModule } from "@angular/cdk/scrolling";
// Modules
import { CoreUIModule } from '@wf1/core-ui';
import { ApiModule } from '@wf1/incidents-rest-api';
import { NgxMaskModule } from "ngx-mask";
import { NROFRoutingModule } from "./nrof.routing.module";
import { NROFDetailComponent } from "./components/detail/nrof-detail.component";
import { NROFListComponent } from "./components/list/nrof-list.component";
import { CoreModule } from "../core/core.module";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';


@NgModule({
    imports: [
        CommonModule,
        NROFRoutingModule,
        CoreUIModule,
        ApiModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        MatTooltipModule,
        MatTableModule,
        CdkTableModule,
        ScrollingModule,
        CoreModule,
        NgxMaskModule.forRoot(),
    ],
    declarations: [
        NROFListComponent,
        NROFDetailComponent
    ],
    exports: [
        NROFListComponent,
        NROFDetailComponent
    ]
})
export class NROFModule { }
