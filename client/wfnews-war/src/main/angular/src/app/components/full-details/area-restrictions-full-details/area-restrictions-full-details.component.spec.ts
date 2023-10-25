import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaRestrictionsFullDetailsComponent } from './area-restrictions-full-details.component';

describe('AreaRestrictionsFullDetailsComponent', () => {
  let component: AreaRestrictionsFullDetailsComponent;
  let fixture: ComponentFixture<AreaRestrictionsFullDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AreaRestrictionsFullDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaRestrictionsFullDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
