import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'blog-widget',
  templateUrl: './blog-widget.component.html',
  styleUrls: ['./blog-widget.component.scss'],
})
export class BlogWidget implements AfterViewInit {
  public startupComplete = false;

  constructor() {}

  ngAfterViewInit(): void {
    // We probably have nothing to do for this widget
    this.startupComplete = true;
  }
}
