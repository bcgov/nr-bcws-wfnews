import { WFActiveFireCountContainerComponent } from './wf-active-fire-count-container.component';
import { ComponentFixture }  from '@angular/core/testing';
import { TestBed }  from '@angular/core/testing';

TestBed.configureTestingModule({
    imports: [ /*… */ ],
    declarations: [ WFActiveFireCountContainerComponent ],
    providers: [ /*… */ ],
  }).compileComponents();

describe('CounterComponent', () => {
    let fixture: ComponentFixture<WFActiveFireCountContainerComponent>;
  
    beforeEach(async () => {
       await TestBed.configureTestingModule({
         declarations: [WFActiveFireCountContainerComponent],
       }).compileComponents();
  
       fixture = TestBed.createComponent(WFActiveFireCountContainerComponent);
       fixture.detectChanges();
     });

       it('…', () => {
       /* … */
     });
   });
