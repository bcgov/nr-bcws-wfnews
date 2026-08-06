import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { WFMapService } from '@app/services/wf-map.service';

import { WildfiresListHeaderComponent } from './wildfires-list-header.component';

describe('WildfiresListHeaderComponent', () => {
  let component: WildfiresListHeaderComponent;
  let fixture: ComponentFixture<WildfiresListHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // AppConfigService (@wf1/core-ui) resolves HttpBackend from the injector;
      // the rest cover the component's own constructor dependencies.
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatDialogModule,
        MatIconModule,
        NoopAnimationsModule,
      ],
      declarations: [WildfiresListHeaderComponent],
      providers: [{ provide: WFMapService, useValue: {} }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WildfiresListHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
