import { Component, OnDestroy, OnInit } from '@angular/core';
import { isMobileView } from '../../../utils';

@Component({
  selector: 'scroll-to-top-button',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
})
export class ScrollToTopComponent implements OnInit, OnDestroy {
  isMobileView = isMobileView;
  isButtonVisible = false;

  ngOnInit() {
    window.addEventListener('scroll', this.scrollEvent, true);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollEvent, true);
  }

  onScrollToTop(): void {
    document
      .getElementsByClassName('top')[0]
      .scrollIntoView({ behavior: 'smooth' });
  }

  scrollEvent = (): void => {
    const offset = document
      .getElementsByClassName('top')[0]
      .getBoundingClientRect().y;
    this.isButtonVisible = offset < -100 && isMobileView();
  };
}
