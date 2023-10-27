import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'mobile-sliding-drawer',
  templateUrl: './mobile-sliding-drawer.component.html',
  styleUrls: ['./mobile-sliding-drawer.component.scss']
})
export class MobileSlidingDrawerComponent {
  @Input() isVisible: boolean;
  @Input() title: string;

  @ViewChild('drawerElement')
  drawerElement: ElementRef;

  @ViewChild('drawerHeaderElement')
  drawerHeaderElement: ElementRef;

  dragPosition = { x: 0, y: 0 };

  closePanel() {
    this.isVisible = false;
  }

  calculatePosition(endDragEvent) {
    const deltaY = endDragEvent.distance.y;
    if ((deltaY < -100 && this.isDefaultPosition()) || (deltaY < (-1 * this.getDrawerHeight())) ) {
      this.setToFullScreen();
    } else if ((deltaY > 100 && this.isDefaultPosition()) || (deltaY > (this.getDrawerHeight())) ) {
      this.setToMinimized();
    } else if ((deltaY < -100 && this.isMinimized()) || (deltaY > 100 && this.isFullScreen())) {
      this.setToDefaultPosition();
    }
  }

  setPosition() {
    this.dragPosition = { x: 0, y: (this.isFullScreen() ? 0 : this.getTopPosition()) };
  }

  closeDrawer() {
    this.setToMinimized();
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
    return (window.innerHeight * -1) + this.getDrawerHeight();
  }

  getMinimizedPosition() {
    return this.getDrawerHeight() - this.getHeaderHeight();
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
