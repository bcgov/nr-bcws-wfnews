import { NoopScrollStrategy } from '@angular/cdk/overlay';
let uniqueId = 0;
export class OwlDialogConfig {
    constructor() {
        /**
         * ID of the element that describes the dialog.
         */
        this.ariaDescribedBy = null;
        /**
         * Whether to focus the dialog when the dialog is opened
         */
        this.autoFocus = true;
        /** Whether the dialog has a backdrop. */
        this.hasBackdrop = true;
        /** Data being injected into the child component. */
        this.data = null;
        /** Whether the user can use escape or clicking outside to close a modal. */
        this.disableClose = false;
        /**
         * The ARIA role of the dialog element.
         */
        this.role = 'dialog';
        /**
         * Custom class for the pane
         * */
        this.paneClass = '';
        /**
         * Mouse Event
         * */
        this.event = null;
        /**
         * Custom class for the backdrop
         * */
        this.backdropClass = '';
        /**
         * Whether the dialog should close when the user goes backwards/forwards in history.
         * */
        this.closeOnNavigation = true;
        /** Width of the dialog. */
        this.width = '';
        /** Height of the dialog. */
        this.height = '';
        /**
         * The max-width of the overlay panel.
         * If a number is provided, pixel units are assumed.
         * */
        this.maxWidth = '85vw';
        /**
         * The scroll strategy when the dialog is open
         * Learn more this from https://material.angular.io/cdk/overlay/overview#scroll-strategies
         * */
        this.scrollStrategy = new NoopScrollStrategy();
        this.id = `owl-dialog-${uniqueId++}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbmZpZy5jbGFzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3BpY2tlci9zcmMvbGliL2RpYWxvZy9kaWFsb2ctY29uZmlnLmNsYXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE9BQU8sRUFBRSxrQkFBa0IsRUFBa0IsTUFBTSxzQkFBc0IsQ0FBQztBQUUxRSxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFpQmpCLE1BQU0sT0FBTyxlQUFlO0lBZ0d4QjtRQS9GQTs7V0FFRztRQUNJLG9CQUFlLEdBQW1CLElBQUksQ0FBQztRQUU5Qzs7V0FFRztRQUNJLGNBQVMsR0FBSSxJQUFJLENBQUM7UUFFekIseUNBQXlDO1FBQ2xDLGdCQUFXLEdBQUksSUFBSSxDQUFDO1FBTzNCLG9EQUFvRDtRQUM3QyxTQUFJLEdBQVMsSUFBSSxDQUFDO1FBRXpCLDRFQUE0RTtRQUNyRSxpQkFBWSxHQUFJLEtBQUssQ0FBQztRQU83Qjs7V0FFRztRQUNJLFNBQUksR0FBOEIsUUFBUSxDQUFDO1FBRWxEOzthQUVLO1FBQ0UsY0FBUyxHQUF1QixFQUFFLENBQUM7UUFFMUM7O2FBRUs7UUFDRSxVQUFLLEdBQWdCLElBQUksQ0FBQztRQUVqQzs7YUFFSztRQUNFLGtCQUFhLEdBQXVCLEVBQUUsQ0FBQztRQUU5Qzs7YUFFSztRQUNFLHNCQUFpQixHQUFhLElBQUksQ0FBQztRQUUxQywyQkFBMkI7UUFDcEIsVUFBSyxHQUFZLEVBQUUsQ0FBQztRQUUzQiw0QkFBNEI7UUFDckIsV0FBTSxHQUFZLEVBQUUsQ0FBQztRQWM1Qjs7O2FBR0s7UUFDRSxhQUFRLEdBQXFCLE1BQU0sQ0FBQztRQVczQzs7O2FBR0s7UUFDRSxtQkFBYyxHQUFvQixJQUFJLGtCQUFrQixFQUFFLENBQUM7UUFLOUQsSUFBSSxDQUFDLEVBQUUsR0FBRyxjQUFjLFFBQVEsRUFBRSxFQUFFLENBQUM7SUFDekMsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBkaWFsb2ctY29uZmlnLmNsYXNzXG4gKi9cbmltcG9ydCB7IFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5vb3BTY3JvbGxTdHJhdGVneSwgU2Nyb2xsU3RyYXRlZ3kgfSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5cbmxldCB1bmlxdWVJZCA9IDA7XG5cbi8qKiBQb3NzaWJsZSBvdmVycmlkZXMgZm9yIGEgZGlhbG9nJ3MgcG9zaXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIERpYWxvZ1Bvc2l0aW9uIHtcbiAgICAvKiogT3ZlcnJpZGUgZm9yIHRoZSBkaWFsb2cncyB0b3AgcG9zaXRpb24uICovXG4gICAgdG9wPzogc3RyaW5nO1xuXG4gICAgLyoqIE92ZXJyaWRlIGZvciB0aGUgZGlhbG9nJ3MgYm90dG9tIHBvc2l0aW9uLiAqL1xuICAgIGJvdHRvbT86IHN0cmluZztcblxuICAgIC8qKiBPdmVycmlkZSBmb3IgdGhlIGRpYWxvZydzIGxlZnQgcG9zaXRpb24uICovXG4gICAgbGVmdD86IHN0cmluZztcblxuICAgIC8qKiBPdmVycmlkZSBmb3IgdGhlIGRpYWxvZydzIHJpZ2h0IHBvc2l0aW9uLiAqL1xuICAgIHJpZ2h0Pzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgT3dsRGlhbG9nQ29uZmlnIHtcbiAgICAvKipcbiAgICAgKiBJRCBvZiB0aGUgZWxlbWVudCB0aGF0IGRlc2NyaWJlcyB0aGUgZGlhbG9nLlxuICAgICAqL1xuICAgIHB1YmxpYyBhcmlhRGVzY3JpYmVkQnk/OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdG8gZm9jdXMgdGhlIGRpYWxvZyB3aGVuIHRoZSBkaWFsb2cgaXMgb3BlbmVkXG4gICAgICovXG4gICAgcHVibGljIGF1dG9Gb2N1cz8gPSB0cnVlO1xuXG4gICAgLyoqIFdoZXRoZXIgdGhlIGRpYWxvZyBoYXMgYSBiYWNrZHJvcC4gKi9cbiAgICBwdWJsaWMgaGFzQmFja2Ryb3A/ID0gdHJ1ZTtcblxuICAgIC8qKlxuICAgICAqIEN1c3RvbSBzdHlsZSBmb3IgdGhlIGJhY2tkcm9wXG4gICAgICogKi9cbiAgICBwdWJsaWMgYmFja2Ryb3BTdHlsZT86IGFueTtcblxuICAgIC8qKiBEYXRhIGJlaW5nIGluamVjdGVkIGludG8gdGhlIGNoaWxkIGNvbXBvbmVudC4gKi9cbiAgICBwdWJsaWMgZGF0YT86IGFueSA9IG51bGw7XG5cbiAgICAvKiogV2hldGhlciB0aGUgdXNlciBjYW4gdXNlIGVzY2FwZSBvciBjbGlja2luZyBvdXRzaWRlIHRvIGNsb3NlIGEgbW9kYWwuICovXG4gICAgcHVibGljIGRpc2FibGVDbG9zZT8gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIElEIGZvciB0aGUgbW9kYWwuIElmIG9taXR0ZWQsIGEgdW5pcXVlIG9uZSB3aWxsIGJlIGdlbmVyYXRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgaWQ/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgQVJJQSByb2xlIG9mIHRoZSBkaWFsb2cgZWxlbWVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgcm9sZT86ICdkaWFsb2cnIHwgJ2FsZXJ0ZGlhbG9nJyA9ICdkaWFsb2cnO1xuXG4gICAgLyoqXG4gICAgICogQ3VzdG9tIGNsYXNzIGZvciB0aGUgcGFuZVxuICAgICAqICovXG4gICAgcHVibGljIHBhbmVDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdID0gJyc7XG5cbiAgICAvKipcbiAgICAgKiBNb3VzZSBFdmVudFxuICAgICAqICovXG4gICAgcHVibGljIGV2ZW50PzogTW91c2VFdmVudCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBDdXN0b20gY2xhc3MgZm9yIHRoZSBiYWNrZHJvcFxuICAgICAqICovXG4gICAgcHVibGljIGJhY2tkcm9wQ2xhc3M/OiBzdHJpbmcgfCBzdHJpbmdbXSA9ICcnO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgZGlhbG9nIHNob3VsZCBjbG9zZSB3aGVuIHRoZSB1c2VyIGdvZXMgYmFja3dhcmRzL2ZvcndhcmRzIGluIGhpc3RvcnkuXG4gICAgICogKi9cbiAgICBwdWJsaWMgY2xvc2VPbk5hdmlnYXRpb24/OiBib29sZWFuID0gdHJ1ZTtcblxuICAgIC8qKiBXaWR0aCBvZiB0aGUgZGlhbG9nLiAqL1xuICAgIHB1YmxpYyB3aWR0aD86IHN0cmluZyA9ICcnO1xuXG4gICAgLyoqIEhlaWdodCBvZiB0aGUgZGlhbG9nLiAqL1xuICAgIHB1YmxpYyBoZWlnaHQ/OiBzdHJpbmcgPSAnJztcblxuICAgIC8qKlxuICAgICAqIFRoZSBtaW4td2lkdGggb2YgdGhlIG92ZXJsYXkgcGFuZWwuXG4gICAgICogSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIHBpeGVsIHVuaXRzIGFyZSBhc3N1bWVkLlxuICAgICAqICovXG4gICAgcHVibGljIG1pbldpZHRoPzogbnVtYmVyIHwgc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG1pbi1oZWlnaHQgb2YgdGhlIG92ZXJsYXkgcGFuZWwuXG4gICAgICogSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIHBpeGVsIHVuaXRzIGFyZSBhc3N1bWVkLlxuICAgICAqICovXG4gICAgcHVibGljIG1pbkhlaWdodD86IG51bWJlciB8IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFRoZSBtYXgtd2lkdGggb2YgdGhlIG92ZXJsYXkgcGFuZWwuXG4gICAgICogSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIHBpeGVsIHVuaXRzIGFyZSBhc3N1bWVkLlxuICAgICAqICovXG4gICAgcHVibGljIG1heFdpZHRoPzogbnVtYmVyIHwgc3RyaW5nID0gJzg1dncnO1xuXG4gICAgLyoqXG4gICAgICogVGhlIG1heC1oZWlnaHQgb2YgdGhlIG92ZXJsYXkgcGFuZWwuXG4gICAgICogSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIHBpeGVsIHVuaXRzIGFyZSBhc3N1bWVkLlxuICAgICAqICovXG4gICAgcHVibGljIG1heEhlaWdodD86IG51bWJlciB8IHN0cmluZztcblxuICAgIC8qKiBQb3NpdGlvbiBvdmVycmlkZXMuICovXG4gICAgcHVibGljIHBvc2l0aW9uPzogRGlhbG9nUG9zaXRpb247XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2Nyb2xsIHN0cmF0ZWd5IHdoZW4gdGhlIGRpYWxvZyBpcyBvcGVuXG4gICAgICogTGVhcm4gbW9yZSB0aGlzIGZyb20gaHR0cHM6Ly9tYXRlcmlhbC5hbmd1bGFyLmlvL2Nkay9vdmVybGF5L292ZXJ2aWV3I3Njcm9sbC1zdHJhdGVnaWVzXG4gICAgICogKi9cbiAgICBwdWJsaWMgc2Nyb2xsU3RyYXRlZ3k/OiBTY3JvbGxTdHJhdGVneSA9IG5ldyBOb29wU2Nyb2xsU3RyYXRlZ3koKTtcblxuICAgIHB1YmxpYyB2aWV3Q29udGFpbmVyUmVmPzogVmlld0NvbnRhaW5lclJlZjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmlkID0gYG93bC1kaWFsb2ctJHt1bmlxdWVJZCsrfWA7XG4gICAgfVxufVxuIl19