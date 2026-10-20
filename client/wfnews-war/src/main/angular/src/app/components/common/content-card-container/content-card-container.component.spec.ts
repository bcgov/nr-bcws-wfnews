import { TestBed } from '@angular/core/testing';
import { ContentCardContainerComponent } from './content-card-container.component';

describe('ContentCardContainerComponent', () => {
  let page: HTMLElement;

  // Computed styles need the card in the document, inside the page it is drawn on.
  const card = (flat: boolean, raised = false) => {
    const fixture = TestBed.createComponent(ContentCardContainerComponent);
    fixture.componentInstance.raised = raised;
    fixture.detectChanges();
    const wrapper = document.createElement('div');
    wrapper.classList.toggle('flat-cards', flat);
    wrapper.appendChild(fixture.nativeElement);
    page.appendChild(wrapper);
    return getComputedStyle(fixture.nativeElement.querySelector('.content-card-container'));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [ContentCardContainerComponent] });
    page = document.createElement('div');
    document.body.appendChild(page);
  });

  afterEach(() => page.remove());

  it('is a card outside a flat page', () => {
    const style = card(false);
    expect(style.boxShadow).not.toBe('none');
    expect(style.borderTopLeftRadius).toBe('16px');
  });

  it('is a flat section on a flat page', () => {
    const style = card(true);
    expect(style.boxShadow).toBe('none');
    expect(style.borderTopLeftRadius).toBe('0px');
    expect(style.borderTopStyle).toBe('none');
  });

  it('stays a card on a flat page when raised', () => {
    const style = card(true, true);
    expect(style.boxShadow).not.toBe('none');
    expect(style.borderTopLeftRadius).toBe('16px');
  });
});
