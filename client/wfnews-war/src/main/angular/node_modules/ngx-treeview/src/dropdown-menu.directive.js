import { Directive } from '@angular/core';
import { DropdownDirective } from './dropdown.directive';
var DropdownMenuDirective = /** @class */ (function () {
    function DropdownMenuDirective(dropdown) {
        this.dropdown = dropdown;
    }
    DropdownMenuDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[ngxDropdownMenu]',
                    // tslint:disable-next-line:use-host-property-decorator
                    host: {
                        '[class.dropdown-menu]': 'true',
                        '[class.show]': 'dropdown.isOpen'
                    }
                },] },
    ];
    /** @nocollapse */
    DropdownMenuDirective.ctorParameters = function () { return [
        { type: DropdownDirective }
    ]; };
    return DropdownMenuDirective;
}());
export { DropdownMenuDirective };
//# sourceMappingURL=dropdown-menu.directive.js.map