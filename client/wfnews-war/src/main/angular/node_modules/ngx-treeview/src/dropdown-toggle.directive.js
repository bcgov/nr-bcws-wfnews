import { Directive, ElementRef } from '@angular/core';
import { DropdownDirective } from './dropdown.directive';
var DropdownToggleDirective = /** @class */ (function () {
    function DropdownToggleDirective(dropdown, elementRef) {
        this.dropdown = dropdown;
        dropdown.toggleElement = elementRef.nativeElement;
    }
    DropdownToggleDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[ngxDropdownToggle]',
                    // tslint:disable-next-line:use-host-property-decorator
                    host: {
                        'class': 'dropdown-toggle',
                        'aria-haspopup': 'true',
                        '[attr.aria-expanded]': 'dropdown.isOpen',
                        '(click)': 'dropdown.toggle()'
                    }
                },] },
    ];
    /** @nocollapse */
    DropdownToggleDirective.ctorParameters = function () { return [
        { type: DropdownDirective },
        { type: ElementRef }
    ]; };
    return DropdownToggleDirective;
}());
export { DropdownToggleDirective };
//# sourceMappingURL=dropdown-toggle.directive.js.map