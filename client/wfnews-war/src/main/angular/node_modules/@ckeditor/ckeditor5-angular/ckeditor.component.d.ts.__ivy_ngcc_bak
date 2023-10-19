/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md.
 */
declare global {
    interface Window {
        CKEDITOR_VERSION?: string;
    }
}
import { NgZone, EventEmitter, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { CKEditor5 } from './ckeditor';
export interface BlurEvent {
    event: CKEditor5.EventInfo<'blur'>;
    editor: CKEditor5.Editor;
}
export interface FocusEvent {
    event: CKEditor5.EventInfo<'focus'>;
    editor: CKEditor5.Editor;
}
export interface ChangeEvent {
    event: CKEditor5.EventInfo<'change:data'>;
    editor: CKEditor5.Editor;
}
export declare class CKEditorComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
    /**
     * The reference to the DOM element created by the component.
     */
    private elementRef;
    /**
     * The constructor of the editor to be used for the instance of the component.
     * It can be e.g. the `ClassicEditorBuild`, `InlineEditorBuild` or some custom editor.
     */
    editor?: CKEditor5.EditorConstructor;
    /**
     * The configuration of the editor.
     * See https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html
     * to learn more.
     */
    config: CKEditor5.Config;
    /**
     * The initial data of the editor. Useful when not using the ngModel.
     * See https://angular.io/api/forms/NgModel to learn more.
     */
    data: string;
    /**
     * Tag name of the editor component.
     *
     * The default tag is 'div'.
     */
    tagName: string;
    /**
     * The context watchdog.
     */
    watchdog?: CKEditor5.ContextWatchdog;
    /**
     * When set `true`, the editor becomes read-only.
     * See https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#member-isReadOnly
     * to learn more.
     */
    set disabled(isDisabled: boolean);
    get disabled(): boolean;
    /**
     * Fires when the editor is ready. It corresponds with the `editor#ready`
     * https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#event-ready
     * event.
     */
    ready: EventEmitter<CKEditor5.Editor>;
    /**
     * Fires when the content of the editor has changed. It corresponds with the `editor.model.document#change`
     * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_document-Document.html#event-change
     * event.
     */
    change: EventEmitter<ChangeEvent>;
    /**
     * Fires when the editing view of the editor is blurred. It corresponds with the `editor.editing.view.document#blur`
     * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_document-Document.html#event-event:blur
     * event.
     */
    blur: EventEmitter<BlurEvent>;
    /**
     * Fires when the editing view of the editor is focused. It corresponds with the `editor.editing.view.document#focus`
     * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_document-Document.html#event-event:focus
     * event.
     */
    focus: EventEmitter<FocusEvent>;
    /**
     * Fires when the editor component crashes.
     */
    error: EventEmitter<void>;
    /**
     * The instance of the editor created by this component.
     */
    get editorInstance(): CKEditor5.Editor | null;
    /**
     * The editor watchdog. It is created when the context watchdog is not passed to the component.
     * It keeps the editor running.
     */
    private editorWatchdog?;
    /**
     * If the component is read–only before the editor instance is created, it remembers that state,
     * so the editor can become read–only once it is ready.
     */
    private initiallyDisabled;
    /**
     * An instance of https://angular.io/api/core/NgZone to allow the interaction with the editor
     * withing the Angular event loop.
     */
    private ngZone;
    /**
     * A callback executed when the content of the editor changes. Part of the
     * `ControlValueAccessor` (https://angular.io/api/forms/ControlValueAccessor) interface.
     *
     * Note: Unset unless the component uses the `ngModel`.
     */
    private cvaOnChange?;
    /**
     * A callback executed when the editor has been blurred. Part of the
     * `ControlValueAccessor` (https://angular.io/api/forms/ControlValueAccessor) interface.
     *
     * Note: Unset unless the component uses the `ngModel`.
     */
    private cvaOnTouched?;
    /**
     * Reference to the source element used by the editor.
     */
    private editorElement?;
    /**
     * A lock flag preventing from calling the `cvaOnChange()` during setting editor data.
     */
    private isEditorSettingData;
    private id;
    constructor(elementRef: ElementRef, ngZone: NgZone);
    ngAfterViewInit(): void;
    ngOnDestroy(): Promise<void>;
    writeValue(value: string | null): void;
    registerOnChange(callback: (data: string) => void): void;
    registerOnTouched(callback: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    /**
     * Creates the editor instance, sets initial editor data, then integrates
     * the editor with the Angular component. This method does not use the `editor.setData()`
     * because of the issue in the collaboration mode (#6).
     */
    private attachToWatchdog;
    private getConfig;
    /**
     * Integrates the editor with the component by attaching related event listeners.
     */
    private setUpEditorEvents;
}
