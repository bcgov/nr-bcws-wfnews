import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfAdminPanelComponent } from './wf-admin-panel.component';

describe('WfAdminPanelComponent', () => {
  let component: WfAdminPanelComponent;
  let fixture: ComponentFixture<WfAdminPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfAdminPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WfAdminPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
