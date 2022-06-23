import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { ScrollingModule } from "@angular/cdk/scrolling";
// Components
import { ROFListComponent } from './components/list/rof-list.component';
import { ROFDetailComponent } from "./components/detail/rof-detail.component";
// Modules
import { CoreUIModule } from '@wf1/core-ui';
import { ApiModule } from '@wf1/incidents-rest-api';
import { ROFRoutingModule } from './rof.routing.module';
import { NgxMaskModule } from "ngx-mask";
import { CoreModule } from '../core/core.module';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
    imports: [
        CommonModule,
        ROFRoutingModule,
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
        NgxMaskModule.forRoot(),
        CoreModule
    ],
    declarations: [
        ROFListComponent,
        ROFDetailComponent
    ],
    exports: [
        ROFListComponent,
        ROFDetailComponent
    ]
})
export class ROFModule { }
