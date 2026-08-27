import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';

/** Start a little before the box arrives, so it is filled when the user gets there. */
const MARGIN = '200px';

/**
 * Tells the host when it comes into view, one time.
 *
 * The Dashboard holds twelve widgets, and each one asks the API when it is made.
 * On a weak connection those requests fight each other, and eleven of them are for
 * a box that the user cannot see. With this directive a widget is made when it is
 * near the screen, so the screen in front of the user gets the connection.
 *
 * With `deferLoadRepeat`, the host tells each time it comes back into view. A list
 * uses this to get its next page when the user scrolls to the end.
 */
@Directive({
  selector: '[wfnewsDeferLoad]',
})
export class DeferLoadDirective implements AfterViewInit, OnDestroy {
  /** Keep watching, so a list end can ask for each next page. */
  @Input() deferLoadRepeat = false;

  @Output() visible = new EventEmitter<void>();

  private observer: IntersectionObserver | undefined;

  constructor(
    private host: ElementRef<HTMLElement>,
    private zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    // An old WebView has no observer. Then everything loads, as it did before.
    if (typeof IntersectionObserver === 'undefined') {
      this.announce();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.announce();
        }
      },
      { rootMargin: MARGIN },
    );
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /** The observer runs outside Angular, so the view must be told to look again. */
  private announce(): void {
    if (!this.deferLoadRepeat) {
      this.observer?.disconnect();
      this.observer = undefined;
    }
    this.zone.run(() => this.visible.emit());
  }
}
