import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'mobile-sliding-drawer',
  templateUrl: './mobile-sliding-drawer.component.html',
  styleUrls: ['./mobile-sliding-drawer.component.scss'],
})
export class MobileSlidingDrawerComponent {
  @Input() isVisible: boolean;
  @Output() isVisibleChange = new EventEmitter<boolean>();

  @Input() isGreyBackground: boolean;

  @Input() title: string;

  @ViewChild('drawerElement')
  drawerElement: ElementRef;

  @ViewChild('drawerHeaderElement')
  drawerHeaderElement: ElementRef;

  @ViewChild('drawerContentElement')
  drawerContentElement: ElementRef;

  dragPosition = { x: 0, y: 0 };

  closePanel() {
    this.isVisible = false;
  }

  calculatePosition(endDragEvent) {
    const deltaY = endDragEvent.distance.y;
    const isMovingUp = deltaY < 0;
    const isMovingDown = deltaY > 0;
    const isPastThreshold = Math.abs(deltaY) > 100;
    const isBigSwipe = Math.abs(deltaY) > this.getDrawerHeight();

    if (this.isDefaultPosition() && isMovingUp && isPastThreshold) {
      this.setToFullScreen();
    } else if (this.isDefaultPosition() && isMovingDown && isPastThreshold) {
      this.closeDrawer();
    } else if (this.isDefaultPosition() && !isPastThreshold) {
      this.setToDefaultPosition();
    } else if (this.isFullScreen() && isMovingDown && isBigSwipe) {
      this.closeDrawer();
    } else if (this.isFullScreen() && isMovingDown && isPastThreshold) {
      this.setToDefaultPosition();
    } else if (this.isFullScreen() && (isMovingUp || !isPastThreshold)) {
      this.setToFullScreen();
    } else if (this.isMinimized() && isMovingUp && isBigSwipe) {
      this.setToFullScreen();
    } else if (this.isMinimized() && isMovingUp && isPastThreshold) {
      this.setToDefaultPosition();
    } else if (this.isMinimized() && (isMovingDown || !isPastThreshold)) {
      this.setToMinimized();
    }

    this.setContentHeight();
  }

  setPosition() {
    if (this.isFullScreen()) {
      this.setToDefaultPosition();
    } else {
      this.setToFullScreen();
    }
    this.setContentHeight();
  }

  setContentHeight() {
    const padding = 40;
    if (this.drawerContentElement?.nativeElement && this.isFullScreen()) {
      this.drawerContentElement.nativeElement.style.height = `${
        window.innerHeight - this.getHeaderHeight() - padding
      }px`;
    } else if (this.drawerContentElement?.nativeElement) {
      this.drawerContentElement.nativeElement.style.height =
        this.getDrawerHeight() - this.getHeaderHeight() - padding + 'px';
    }
  }

  closeDrawer() {
    this.setToDefaultPosition();
    this.isVisible = false;
    this.isVisibleChange.emit(this.isVisible);
  }

  getHeaderHeight() {
    return this.drawerHeaderElement?.nativeElement.offsetHeight as number;
  }

  getDrawerHeight() {
    return this.drawerElement?.nativeElement.offsetHeight as number;
  }

  getDefaultPosition() {
    return 0;
  }

  getTopPosition() {
    return (
      window.innerHeight * -1 - 1 + this.getDrawerHeight() + this.getSafeInset()
    );
  }

  getMinimizedPosition() {
    return this.getDrawerHeight() - this.getHeaderHeight();
  }

  getSafeInset() {
    return parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--sat'),
      10,
    );
  }

  isDefaultPosition() {
    return this.dragPosition.y === this.getDefaultPosition();
  }

  isFullScreen() {
    return this.dragPosition.y === this.getTopPosition();
  }

  isMinimized() {
    return this.dragPosition.y === this.getMinimizedPosition();
  }

  setToDefaultPosition() {
    this.dragPosition = { x: 0, y: this.getDefaultPosition() };
  }

  setToFullScreen() {
    this.dragPosition = { x: 0, y: this.getTopPosition() };
  }

  setToMinimized() {
    this.dragPosition = { x: 0, y: this.getMinimizedPosition() };
  }
}
