import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {Store} from "@ngrx/store";
import {RootState} from "../../../store";

@Directive({
  selector: '[sngClick]'
})
export class SingleClickDirective {
  @Input('sngClickData') data: any;
  @Input('sngClickFn') callback: Function;
  clicks = 0;
  timer = null;
  
  public constructor(private store: Store<RootState>, private el: ElementRef) {
  
  }
  
  @HostListener('click', ['$event'])
  clickEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks++;  //count clicks
    if (this.clicks === 1) {
      this.timer = setTimeout(() => {
        this.callback(this.data.input);
        this.clicks = 0;             //after action performed, reset counter
      }, this.data && this.data.delay ? this.data.delay : 300);
    } else {
      clearTimeout(this.timer);    //prevent single-click action
      this.clicks = 0;             //after action performed, reset counter
    }
    
  }
}
