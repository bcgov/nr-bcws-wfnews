import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreUIModule } from '@wf1/core-ui';
import { ApiModule } from '@wf1/incidents-rest-api';
import { PlaceNameSearchComponent } from "./components/search/place-name-search.component";
import { PlaceNameSearchRoutingModule } from './place-name-search.routing.module';
import { SliderInputComponent } from "./components/slider-input/slider-input.component";
import { CoreModule } from '../core/core.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
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
        MatTableModule,
        MatTooltipModule,
        MatSelectModule,
        MatSliderModule,
        PlaceNameSearchRoutingModule,
        ReactiveFormsModule,
        CoreModule
    ],
    declarations: [
        PlaceNameSearchComponent,
        SliderInputComponent,
    ],
    exports: [
        PlaceNameSearchComponent,
        PlaceNameSearchRoutingModule,
        SliderInputComponent,
    ]
})
export class PlaceNameSearchModule { }
