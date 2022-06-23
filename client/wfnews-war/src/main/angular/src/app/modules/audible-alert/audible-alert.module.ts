import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreUIModule } from '@wf1/core-ui';
import { ApiModule } from '@wf1/incidents-rest-api';
import { CoreModule } from '../core/core.module';
import { AudibleAlertRoutingModule } from "./audible-alert.routing.module";
import { AudibleAlertComponent } from "./components/audible-alert-settings/audible-alert.component";
import { TreeviewModule } from "ngx-treeview";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
    imports: [
        ApiModule,
        CommonModule,
        CoreUIModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatCheckboxModule,
        MatTableModule,
        MatTooltipModule,
        MatSelectModule,
        MatSliderModule,
        AudibleAlertRoutingModule,
        ReactiveFormsModule,
        TreeviewModule.forRoot(),
        CoreModule
    ],
    declarations: [
        AudibleAlertComponent,
    ],
    exports: [
        AudibleAlertComponent,
        AudibleAlertRoutingModule,
    ]
})
export class AudibleAlertModule { }
