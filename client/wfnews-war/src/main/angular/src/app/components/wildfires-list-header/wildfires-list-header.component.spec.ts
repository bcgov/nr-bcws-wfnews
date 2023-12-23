import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WildfiresListHeaderComponent } from './wildfires-list-header.component';

describe('WildfiresListHeaderComponent', () => {
  let component: WildfiresListHeaderComponent;
  let fixture: ComponentFixture<WildfiresListHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WildfiresListHeaderComponent],
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
