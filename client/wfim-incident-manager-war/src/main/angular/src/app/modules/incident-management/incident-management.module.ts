import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Modules
import { CoreUIModule } from '@wf1/core-ui';
import { ApiModule } from '@wf1/incidents-rest-api';
import { IncidentManagementRoutingModule } from './incident-management.routing.module';
// Components
import { IncidentListComponent } from './components';
import { IncidentDetailComponent } from "./components/detail/incident-detail.component";
import { CdkTableModule } from "@angular/cdk/table";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CoreModule } from '../core/core.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
    imports: [
        ApiModule,
        CommonModule,
        CoreUIModule,
        FormsModule,
        IncidentManagementRoutingModule,
        MatExpansionModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule,
        CdkTableModule,
        ReactiveFormsModule,
        ScrollingModule,
        CoreModule
    ],
    declarations: [
        IncidentListComponent,
        IncidentDetailComponent,
    ],
    exports: [
        IncidentListComponent,
        IncidentDetailComponent,
        IncidentManagementRoutingModule,
    ]
})
export class IncidentManagementModule { }
