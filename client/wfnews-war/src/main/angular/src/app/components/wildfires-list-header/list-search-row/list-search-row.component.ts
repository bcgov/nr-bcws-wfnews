import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * The search row of the four List page tabs: the Search field and the filter Icon Pills.
 * Each tab keeps its own search and dialog handlers.
 */
@Component({
  selector: 'wfnews-list-search-row',
  templateUrl: './list-search-row.component.html',
  styleUrls: ['./list-search-row.component.scss'],
})
export class ListSearchRowComponent {
  @Input() searchText?: string;
  /** On each keystroke, and with undefined on Clear. The tab waits before it searches. */
  @Output() searchTextChange = new EventEmitter<string | undefined>();
  @Input() locationSelected = false;
  @Output() locationClicked = new EventEmitter<void>();
  /** Only the Wildfires tab has the filter dialog. */
  @Input() showFilter = false;
  @Input() filterSelected = false;
  @Output() filterClicked = new EventEmitter<void>();
}
