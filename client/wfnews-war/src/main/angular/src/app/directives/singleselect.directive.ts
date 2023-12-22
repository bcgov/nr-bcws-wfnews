import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { arrayEquals } from '../utils';

@Directive({
  selector: '[appWFSingleSelect]',
})
export class SingleSelectDirective implements AfterViewInit, OnChanges {
  @Input() appWFPlaceholder?: string;
  @Output() updated: EventEmitter<any> = new EventEmitter();
  @Input() options: any[];
  @Input() selected: any;
  @Input() position = 'bottom';
  @Input() filter = true;
  selectHtmlElement: HTMLSelectElement;
  multiselect;

  constructor(
    private element: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    this.selectHtmlElement = this.element.nativeElement;
    const self = this;
    this.selectHtmlElement.addEventListener('change', function() {
      self.onClick();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.options &&
      !arrayEquals(changes.options.currentValue, changes.options.previousValue)
    ) {
      this.options = changes.options.currentValue;
      setTimeout(() => {
        this.cdr.detectChanges();
        // this.multiselect.multipleSelect("refresh");
      });
    }
    if (changes.selected) {
      setTimeout(() => {
        this.selected = changes.selected.currentValue;
        // this.multiselect.multipleSelect("setSelects", [this.selected]);
      });
    }
    if (changes.appWFPlaceholder) {
      this.appWFPlaceholder = changes.appWFPlaceholder.currentValue;
      setTimeout(() => {
        this.cdr.detectChanges();
        // this.multiselect.multipleSelect("refreshOptions", {"placeholder": this.appWFPlaceholder});
      });
    }
  }

  onClick() {
    let selected = '';
    if (
      this.selectHtmlElement.selectedOptions &&
      this.selectHtmlElement.selectedOptions.length
    ) {
      selected = this.selectHtmlElement.selectedOptions.item(0).value;
    }
    this.updated.emit(selected);
  }
}
