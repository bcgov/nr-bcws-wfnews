import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreUIModule } from '@wf1/core-ui';
import { ApiModule } from '@wf1/incidents-rest-api';
import { PointIdPanelComponent } from "./components/point-id-panel/point-id-panel.component";
import { PointIdRoutingModule } from './point-id.routing.module';
import { CoreModule } from '../core/core.module';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
    imports: [
        ApiModule,
        CommonModule,
        CoreUIModule,
        FormsModule,
        MatButtonModule,
        MatExpansionModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        MatSelectModule,
        MatSliderModule,
        ReactiveFormsModule,
        CoreModule
    ],
    declarations: [
        PointIdPanelComponent,
    ],
    exports: [
        PointIdPanelComponent,
        PointIdRoutingModule,
    ]
})
export class PointIdModule { }
