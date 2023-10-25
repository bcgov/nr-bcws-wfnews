import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullDetailsComponent } from './full-details.component';

describe('FullDetailsComponent', () => {
  let component: FullDetailsComponent;
  let fixture: ComponentFixture<FullDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FullDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
