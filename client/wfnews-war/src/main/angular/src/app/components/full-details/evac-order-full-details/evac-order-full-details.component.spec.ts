import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvacOrderFullDetailsComponent } from './evac-order-full-details.component';

describe('EvacOrderFullDetailsComponent', () => {
  let component: EvacOrderFullDetailsComponent;
  let fixture: ComponentFixture<EvacOrderFullDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvacOrderFullDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvacOrderFullDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
