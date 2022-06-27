import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreUIModule } from '@wf1/core-ui';
import { ApiModule } from '@wf1/incidents-rest-api';

import { InfoIncidentPanelComponent } from './info-incident-panel/info-incident-panel.component';
import { ListItemComponent } from './list-item/list-item.component';
import { LocationToolbarComponent } from './location/location-toolbar.component';
import { LocationSidebarPanelComponent } from './location-sidebar-panel/location-sidebar-panel.component';

import { MomentModule } from 'ngx-moment';
import { ErrorPanelComponent } from "./error-panel/error-panel.component";
import { ErrorDialog412Component } from "./error-dialog-412/error-dialog-412.component";
import { MatRadioModule } from "@angular/material/radio";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatListModule } from '@angular/material/list';
import { LightgalleryModule } from 'lightgallery/angular/11';
import { PhotoGalleryComponent } from './photo/photo-gallery/photo-gallery.component';
import { PhotoPropertiesComponent } from './photo/photo-properties/photo-properties.component';
import { PhotoUploadDialogComponent } from './photo/photo-upload-dialog/photo-upload-dialog.component';
import { PhotoUploadComponent } from './photo/photo-upload/photo-upload.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { WildfireApplicationModule } from '@wf1/wfcc-application-ui';

@NgModule({
    imports: [
        ApiModule,
        CommonModule,
        CoreUIModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatExpansionModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatTabsModule,
        MatTooltipModule,
        MatRadioModule,
        MatSelectModule,
        MatSliderModule,
        MatListModule,
        ReactiveFormsModule,
        MomentModule,
        LightgalleryModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatProgressBarModule,
        MatToolbarModule,
        MatDialogModule,
        WildfireApplicationModule.forRoot(),
    ],
    declarations: [
        InfoIncidentPanelComponent,
        ListItemComponent,
        LocationToolbarComponent,
        LocationSidebarPanelComponent,
        ErrorPanelComponent,
        ErrorDialog412Component,
        PhotoGalleryComponent,
        PhotoPropertiesComponent,
        PhotoUploadComponent,
        PhotoUploadDialogComponent
    ],
    exports: [
        InfoIncidentPanelComponent,
        ListItemComponent,
        LocationToolbarComponent,
        LocationSidebarPanelComponent,
        ErrorPanelComponent,
        ErrorDialog412Component,
        PhotoGalleryComponent,
        PhotoUploadComponent,
    ]
})
export class CoreModule { }
