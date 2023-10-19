import { Location } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { OwlDialogContainerComponent } from './dialog-container.component';
import { DialogPosition } from './dialog-config.class';
import { Observable } from 'rxjs';
export declare class OwlDialogRef<T> {
    private overlayRef;
    private container;
    readonly id: string;
    private result;
    private _beforeClose$;
    private _afterOpen$;
    private _afterClosed$;
    /** Subscription to changes in the user's location. */
    private locationChanged;
    /**
     * The instance of component opened into modal
     * */
    componentInstance: T;
    /** Whether the user is allowed to close the dialog. */
    disableClose: boolean;
    constructor(overlayRef: OverlayRef, container: OwlDialogContainerComponent, id: string, location?: Location);
    close(dialogResult?: any): void;
    /**
     * Gets an observable that emits when the overlay's backdrop has been clicked.
     */
    backdropClick(): Observable<any>;
    /**
     * Gets an observable that emits when keydown events are targeted on the overlay.
     */
    keydownEvents(): Observable<KeyboardEvent>;
    /**
     * Updates the dialog's position.
     * @param position New dialog position.
     */
    updatePosition(position?: DialogPosition): this;
    /**
     * Updates the dialog's width and height.
     * @param width New width of the dialog.
     * @param height New height of the dialog.
     */
    updateSize(width?: string, height?: string): this;
    isAnimating(): boolean;
    afterOpen(): Observable<any>;
    beforeClose(): Observable<any>;
    afterClosed(): Observable<any>;
    /** Fetches the position strategy object from the overlay ref. */
    private getPositionStrategy;
}
