import {Directive, ElementRef} from '@angular/core';

@Directive({
    selector: '[auto-focus]'
})
export class AutoFocusDirective {

    public constructor(private el: ElementRef) {
        setTimeout(() => {
            let nativeEl = this.el.nativeElement as HTMLInputElement;
            nativeEl.focus();
            nativeEl.select();
        }, 100);
    }

}
