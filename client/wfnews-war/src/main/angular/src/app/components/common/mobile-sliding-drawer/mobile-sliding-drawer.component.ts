import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ManagedDrawer, MobileDrawerService } from './mobile-drawer.service';

// The Drawer Stops, as parts of the height under the top Inset.
const STOP_PARTS = [0.25, 0.5, 0.7, 1];
// Keep in step with $drawer-duration in the SCSS.
export const DRAWER_DURATION_MS = 300;
// Below the screen by this much, the shadow does not show either.
const OFFSCREEN_MARGIN = 32;
const DRAG_THRESHOLD = 6;
// A release faster than this, in px per ms, moves at least one Stop in its direction.
const FLICK_SPEED = 0.5;
const MOMENTUM_MS = 200;
const CLOSE_DISTANCE = 32;
const MIN_STOP_GAP = 48;

interface Gesture {
  pointerId: number;
  startY: number;
  startVisible: number;
  dragging: boolean;
  samples: { time: number; y: number }[];
}

@Component({
  selector: 'mobile-sliding-drawer',
  templateUrl: './mobile-sliding-drawer.component.html',
  styleUrls: ['./mobile-sliding-drawer.component.scss'],
})
export class MobileSlidingDrawerComponent
  implements OnChanges, OnDestroy, ManagedDrawer
{
  @Input() isVisible: boolean;
  @Output() isVisibleChange = new EventEmitter<boolean>();

  @Input() title: string;

  /** The Drawer Stop where the Drawer opens, as a part of the height under the top Inset. */
  // Half the screen shows a whole identify card without a drag.
  @Input() startPart = 0.5;

  @Input() showBack = false;
  @Output() back = new EventEmitter<void>();

  /** The height of the Drawer Stop the Drawer moves to, in px. It comes when the motion starts. */
  @Output() restingHeightChange = new EventEmitter<number>();

  @ViewChild('probe', { static: true }) probe: ElementRef<HTMLElement>;
  @ViewChild('sheet') sheet: ElementRef<HTMLElement>;
  @ViewChild('header') header: ElementRef<HTMLElement>;
  @ViewChild('content') content: ElementRef<HTMLElement>;
  @ViewChild('contentInner') contentInner: ElementRef<HTMLElement>;
  @ViewChild('fade') fade: ElementRef<HTMLElement>;
  @ViewChild('footer') footer: ElementRef<HTMLElement>;

  rendered = false;
  atFull = false;

  private stops: number[] = [];
  private startStop = 0;
  private stop = 0;
  private maxHeight = 0;
  private headerHeight = 0;
  private footerHeight = 0;
  private insetBottom = 0;
  private sheetHeight = 0;
  private motionTimer: ReturnType<typeof setTimeout>;
  private gesture: Gesture | null = null;
  private resizeObserver: ResizeObserver;
  private fadeFrame = 0;
  private enterFrame = 0;

  constructor(
    private drawers: MobileDrawerService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    // A new title or back button means new content, and new content starts at the top.
    if (
      (changes.title && !changes.title.firstChange) ||
      (changes.showBack && !changes.showBack.firstChange)
    ) {
      this.content?.nativeElement.scrollTo(0, 0);
    }
    if (!changes.isVisible) {
      return;
    }
    if (this.isVisible) {
      this.drawers.requestOpen(this);
    } else if (!changes.isVisible.firstChange) {
      this.drawers.requestClose(this);
    }
  }

  ngOnDestroy() {
    this.stopMotion();
    this.drawers.destroyed(this);
  }

  @HostListener('window:resize')
  onResize() {
    if (!this.rendered || this.gesture?.dragging) {
      return;
    }
    // A running animation would end at a height from the old screen.
    clearTimeout(this.motionTimer);
    const part = this.stop / this.maxHeight;
    this.measure();
    this.settle(this.nearestStop(part * this.maxHeight));
  }

  closeDrawer() {
    this.isVisible = false;
    this.isVisibleChange.emit(false);
    this.drawers.requestClose(this);
  }

  toggleSize() {
    this.animateTo(this.atFull ? this.startStop : this.maxHeight);
  }

  stepSize(direction: 1 | -1) {
    const next =
      direction > 0
        ? this.stops.find((stop) => stop > this.stop)
        : [...this.stops].reverse().find((stop) => stop < this.stop);
    if (next !== undefined) {
      this.animateTo(next);
    }
  }

  /** Moves a full-height Drawer down to the Stop where it opens, so the map shows. */
  uncoverMap() {
    if (this.rendered && this.atFull) {
      this.animateTo(this.startStop);
    }
  }

  /** The Drawer Stop the Drawer rests at, or moves to now. 0 when it is closed. */
  restingHeight(): number {
    return this.rendered ? this.stop : 0;
  }

  // ManagedDrawer

  visibleHeight(): number {
    const sheet = this.sheet?.nativeElement;
    if (!this.rendered || !sheet) {
      return 0;
    }
    if (!sheet.isConnected) {
      return this.stop;
    }
    const offset = new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m42;
    return Math.max(0, Math.round(this.sheetHeight - offset));
  }

  present(fromHeight: number | null) {
    this.stopMotion();
    this.rendered = true;
    this.cdr.detectChanges();
    this.measure();
    this.watchContent();

    const target =
      fromHeight === null
        ? this.startStop
        : this.nearestStop(fromHeight);
    if (fromHeight === null) {
      this.jump(target, -OFFSCREEN_MARGIN, this.hiddenFooterOffset());
      // The first open shares a long task with the identify, which would use up the slide.
      this.stop = target;
      this.afterFirstPaint(() => this.animateTo(target));
    } else if (Math.abs(target - fromHeight) < 2) {
      this.settle(target);
      this.setInstant(true);
      this.afterFirstPaint(() => this.setInstant(false));
    } else {
      this.jump(this.maxHeight, fromHeight);
      this.setInstant(true);
      this.afterFirstPaint(() => {
        this.setInstant(false);
        this.animateTo(target);
      });
    }
  }

  slideOut() {
    this.stopMotion();
    if (!this.rendered) {
      this.drawers.left(this);
      return;
    }
    this.moveSheet(this.sheetHeight + OFFSCREEN_MARGIN);
    this.moveFooter(this.hiddenFooterOffset());
    this.afterMotion(() => {
      this.hideNow();
      this.drawers.left(this);
    });
  }

  hideNow() {
    this.stopMotion();
    this.rendered = false;
    this.atFull = false;
    this.cdr.detectChanges();
  }

  notifyDismissed() {
    this.zone.run(() => {
      this.isVisible = false;
      this.isVisibleChange.emit(false);
    });
  }

  // Drag on the header

  onPointerDown(event: PointerEvent) {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }
    this.endGesture();
    this.gesture = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startVisible: 0,
      dragging: false,
      samples: [{ time: event.timeStamp, y: event.clientY }],
    };
    this.zone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.onPointerMove);
      window.addEventListener('pointerup', this.onPointerUp);
      window.addEventListener('pointercancel', this.onPointerUp);
    });
  }

  private onPointerMove = (event: PointerEvent) => {
    const gesture = this.gesture;
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }
    if (!gesture.dragging) {
      if (Math.abs(event.clientY - gesture.startY) < DRAG_THRESHOLD) {
        return;
      }
      // Pick the Drawer up where it is, also in the middle of an animation.
      gesture.dragging = true;
      gesture.startY = event.clientY;
      gesture.startVisible = this.visibleHeight();
      clearTimeout(this.motionTimer);
      this.setDragging(true);
      this.jump(this.maxHeight, gesture.startVisible);
    }
    gesture.samples.push({ time: event.timeStamp, y: event.clientY });
    if (gesture.samples.length > 6) {
      gesture.samples.shift();
    }
    const visible = Math.min(
      this.maxHeight,
      Math.max(0, gesture.startVisible - (event.clientY - gesture.startY)),
    );
    this.moveSheet(this.sheetHeight - visible);
    this.moveFooter(this.footerOffsetFor(visible));
    this.queueFadeUpdate();
  };

  private onPointerUp = (event: PointerEvent) => {
    const gesture = this.gesture;
    if (!gesture || event.pointerId !== gesture.pointerId) {
      return;
    }
    this.endGesture();
    if (!gesture.dragging) {
      return;
    }
    this.swallowNextClick();
    this.setDragging(false);
    const target = this.pickStop(this.visibleHeight(), this.speed(gesture.samples));
    this.zone.run(() => {
      if (target === null) {
        this.closeDrawer();
      } else {
        this.animateTo(target);
      }
    });
  };

  private endGesture() {
    this.gesture = null;
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
  }

  // The header moves with the finger, so a button under it gets a click when the drag ends.
  private swallowNextClick() {
    const swallow = (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
    };
    window.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', swallow, true), 400);
  }

  private speed(samples: { time: number; y: number }[]): number {
    const last = samples[samples.length - 1];
    const first = samples.find((sample) => last.time - sample.time <= 100);
    const elapsed = last.time - first.time;
    return elapsed > 0 ? (last.y - first.y) / elapsed : 0;
  }

  private pickStop(visible: number, speed: number): number | null {
    const projected = visible - speed * MOMENTUM_MS;
    if (projected < this.stops[0] - CLOSE_DISTANCE) {
      return null;
    }
    const target = this.nearestStop(projected);
    if (speed > FLICK_SPEED && target >= visible) {
      return [...this.stops].reverse().find((stop) => stop < visible) ?? null;
    }
    if (speed < -FLICK_SPEED && target <= visible) {
      return this.stops.find((stop) => stop > visible) ?? this.maxHeight;
    }
    return target;
  }

  // Motion. Only the transform animates. The height changes before the Drawer
  // grows and after it shrinks, where it does not show.

  private animateTo(target: number) {
    clearTimeout(this.motionTimer);
    const visible = this.visibleHeight();
    if (this.sheetHeight < Math.max(visible, target)) {
      this.jump(this.maxHeight, visible);
    }
    this.stop = target;
    this.atFull = target === this.maxHeight;
    this.cdr.detectChanges();
    // The map moves with the Drawer, not after it.
    this.restingHeightChange.emit(target);
    this.moveSheet(this.sheetHeight - target);
    this.moveFooter(this.footerOffsetFor(target));
    this.queueFadeUpdate();
    this.afterMotion(() => this.settle(target));
  }

  private settle(stop: number) {
    this.stop = stop;
    this.atFull = stop === this.maxHeight;
    this.jump(stop, stop, this.footerOffsetFor(stop));
    this.cdr.detectChanges();
    this.queueFadeUpdate();
    this.restingHeightChange.emit(stop);
  }

  // Place the Drawer with no animation.
  private jump(sheetHeight: number, visible: number, footerOffset = this.footerOffsetFor(visible)) {
    this.setInstant(true);
    this.sheetHeight = sheetHeight;
    this.sheet.nativeElement.style.height = `${sheetHeight}px`;
    this.moveSheet(sheetHeight - visible);
    this.moveFooter(footerOffset);
    // Commit the new place before the next transition starts from it. A call, because
    // the production minifier removes a bare offsetHeight read.
    this.sheet.nativeElement.getBoundingClientRect();
    this.setInstant(false);
  }

  private moveSheet(offset: number) {
    this.sheet.nativeElement.style.transform = `translate3d(0, ${offset}px, 0)`;
    // The opposite move keeps the fade on the screen bottom, not on the sheet bottom below it.
    if (this.fade) {
      this.fade.nativeElement.style.transform = `translate3d(0, ${-offset}px, 0)`;
    }
  }

  private moveFooter(offset: number) {
    if (this.footer) {
      this.footer.nativeElement.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
  }

  private setInstant(instant: boolean) {
    this.motionElements().forEach((element) =>
      element.classList.toggle('instant', instant),
    );
  }

  private setDragging(dragging: boolean) {
    this.motionElements().forEach((element) =>
      element.classList.toggle('dragging', dragging),
    );
  }

  private motionElements(): HTMLElement[] {
    return [this.sheet?.nativeElement, this.footer?.nativeElement, this.fade?.nativeElement].filter(Boolean);
  }

  private afterMotion(done: () => void) {
    clearTimeout(this.motionTimer);
    this.motionTimer = setTimeout(done, this.duration());
  }

  private afterFirstPaint(done: () => void) {
    this.zone.runOutsideAngular(() => {
      this.enterFrame = requestAnimationFrame(() => {
        this.enterFrame = requestAnimationFrame(() => this.zone.run(done));
      });
    });
  }

  private stopMotion() {
    clearTimeout(this.motionTimer);
    cancelAnimationFrame(this.enterFrame);
    this.endGesture();
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.fadeFrame);
  }

  private duration(): number {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : DRAWER_DURATION_MS;
  }

  // The footer stays on the screen bottom. The header pushes it down when the Drawer is short.
  private footerOffsetFor(visible: number): number {
    return Math.min(
      this.hiddenFooterOffset(),
      Math.max(0, this.headerHeight + this.footerHeight - visible),
    );
  }

  private hiddenFooterOffset(): number {
    return this.footerHeight + OFFSCREEN_MARGIN;
  }

  // Sizes

  private measure() {
    const probe = this.probe.nativeElement;
    const style = getComputedStyle(probe);
    const insetTop = parseFloat(style.paddingTop) || 0;
    this.insetBottom = parseFloat(style.paddingBottom) || 0;
    this.maxHeight = Math.round(probe.getBoundingClientRect().height - insetTop);
    this.headerHeight = this.header.nativeElement.offsetHeight;
    this.measureFooter();

    const stops: number[] = [];
    STOP_PARTS.map((part) => Math.round(part * this.maxHeight)).forEach((height) => {
      if (!stops.length || height - stops[stops.length - 1] >= MIN_STOP_GAP) {
        stops.push(height);
      }
    });
    // Full height is always a Stop, even when it is near the one under it.
    if (stops[stops.length - 1] !== this.maxHeight) {
      stops[stops.length - 1] = this.maxHeight;
    }
    this.stops = stops;
    this.startStop = this.nearestStop(this.startPart * this.maxHeight);
  }

  private measureFooter() {
    this.footerHeight = this.footer?.nativeElement.offsetHeight ?? 0;
    // The content ends above the footer, or above the bottom Inset.
    this.sheet.nativeElement.style.setProperty(
      '--footer-space',
      `${this.footerHeight || this.insetBottom}px`,
    );
  }

  private nearestStop(height: number): number {
    return this.stops.reduce((best, stop) =>
      Math.abs(stop - height) < Math.abs(best - height) ? stop : best,
    );
  }

  // The fade and the shadows show only when there is more content in that direction.

  private watchContent() {
    this.resizeObserver?.disconnect();
    const content = this.content.nativeElement;
    this.zone.runOutsideAngular(() => {
      content.removeEventListener('scroll', this.queueFadeUpdate);
      content.addEventListener('scroll', this.queueFadeUpdate, { passive: true });
      this.resizeObserver = new ResizeObserver(() => {
        const footerHeight = this.footer?.nativeElement.offsetHeight ?? 0;
        if (footerHeight !== this.footerHeight && !this.gesture?.dragging) {
          this.measureFooter();
          this.moveFooter(this.footerOffsetFor(this.stop));
        }
        this.queueFadeUpdate();
      });
      this.resizeObserver.observe(content);
      this.resizeObserver.observe(this.contentInner.nativeElement);
      if (this.footer) {
        this.resizeObserver.observe(this.footer.nativeElement);
      }
    });
  }

  private queueFadeUpdate = () => {
    cancelAnimationFrame(this.fadeFrame);
    this.zone.runOutsideAngular(() => {
      this.fadeFrame = requestAnimationFrame(() => {
        const content = this.content?.nativeElement;
        if (!content) {
          return;
        }
        // In motion the sheet is full height and partly below the screen; that part is not seen.
        const shown = this.gesture?.dragging ? this.visibleHeight() : this.stop;
        const hidden = Math.max(0, this.sheetHeight - shown);
        const moreAbove = content.scrollTop > 1;
        const moreBelow = content.scrollTop + content.clientHeight - hidden < content.scrollHeight - 1;
        this.sheet.nativeElement.classList.toggle('more-above', moreAbove);
        this.sheet.nativeElement.classList.toggle('more-below', moreBelow);
        this.footer?.nativeElement.classList.toggle('more-below', moreBelow);
      });
    });
  };
}
