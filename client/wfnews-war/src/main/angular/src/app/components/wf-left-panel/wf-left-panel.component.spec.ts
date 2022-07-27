import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WfLeftPanelComponent } from './wf-left-panel.component';

describe('WfLeftPanelComponent', () => {
  let component: WfLeftPanelComponent;
  let fixture: ComponentFixture<WfLeftPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WfLeftPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WfLeftPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
