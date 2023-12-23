import {
  AfterViewInit,
  Directive,
  Injectable,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { PaginationInstance } from 'ngx-pagination';
import { PagedCollection } from '../../../conversion/models';
import {
  PagingInfoRequest,
  PagingSearchState,
} from '../../../store/application/application.state';
import { NavigationEnd } from '@angular/router';

@Directive()
@Injectable()
export class CollectionComponent
  extends BaseComponent
  implements OnChanges, AfterViewInit {
  @Input() collection: PagedCollection;
  @Input() searchState: PagingSearchState;
  baseRoute = undefined;
  searchText = undefined;
  collectionData: any[];
  initPagingRequest: PagingInfoRequest;
  currentSort;
  currentSortLabel;
  currentSortDirection;
  currentPage;
  columnsToSortBy = [];
  showEntriesSelection = 20; // default
  showEntriesOptions = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
  ];

  summaryString = '';

  isFirstLoad = true;

  initSortingAndPaging(initPaging: PagingInfoRequest) {
    // extending class needs to call this to init
    this.initPagingRequest = initPaging;
    this.currentSort = this.searchState.sortParam;
    this.currentSortDirection = this.searchState.sortDirection;

    const currentSortObj = this.columnsToSortBy.find(
      (col) => col.def === this.currentSort,
    );
    if (currentSortObj) {
      this.currentSortLabel = currentSortObj.label;
    }
    this.currentPage =
      this.searchState?.pageIndex
        ? this.searchState.pageIndex
        : this.initPagingRequest.pageNumber;
    this.showEntriesSelection = Number(
      this.searchState?.pageSize
        ? this.searchState.pageSize
        : this.initPagingRequest.pageRowCount,
    );
  }

  getPagingConfig(): PaginationInstance {
    return {
      ...super.getPagingConfig(),
      id: this.componentId + 'Paginator',
      itemsPerPage: this.showEntriesSelection,
      totalItems:
        this.collection?.totalRowCount
          ? this.collection.totalRowCount
          : 0,
    };
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.baseRoute = this.router.url;
    if (
      this.isFirstLoad &&
      this.baseRoute &&
      this.router.url === this.baseRoute
    ) {
      this.isFirstLoad = false;
      this.router.events.forEach((event) => {
        if (event instanceof NavigationEnd) {
          if (event.url === this.baseRoute) {
            this.doSearch();
          }
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (changes?.collection?.currentValue) {
      this.updateCollection(changes.collection.currentValue);
      setTimeout(() => {
        this.fixPaginationA11y();
      });
    }
    if (changes.searchState) {
      this.searchState = changes.searchState.currentValue
        ? changes.searchState.currentValue
        : this.initPagingRequest;
      this.searchText = this.searchState.query;
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    }
  }

  fixPaginationA11y() {
    const paginationUlEls = document.getElementsByClassName('ngx-pagination');
    if (paginationUlEls?.length) {
      const el = paginationUlEls[0] as HTMLUListElement;
      const aEls = el.getElementsByTagName('a');
      for (let i = 0; i < aEls.length; i++) {
        aEls.item(i).removeAttribute('aria-label');
      }
      el.removeAttribute('role');
      el.removeAttribute('aria-label');
      el.parentElement.setAttribute('role', 'navigation');
      el.parentElement.setAttribute('aria-label', 'Pagination');
    }
  }

  updateCollection(collection: PagedCollection) {
    this.collection = collection;
    this.collectionData = this.collection.collection;
    this.config = this.getPagingConfig();
    this.config.currentPage = this.collection.pageNumber;
    this.summaryString = this.getSummaryString(this.config.id);
  }

  onPageChange(number: number) {
    if (number >= 1) {
      this.config.currentPage = number;
    } else {
      this.config.currentPage +=
        number === -1 && this.config.currentPage > 1 ? -1 : 1;
    }
    this.doSearch();
  }

  onShowEntriesChange() {
    this.config.itemsPerPage = this.showEntriesSelection;
    this.config.currentPage = 1;
    this.doSearch();
  }

  sortData(data) {
    this.currentSort = data.active;
    this.currentSortDirection = data.direction;
    const currentSortObj = this.columnsToSortBy.find(
      (col) => col.def === this.currentSort,
    );
    if (currentSortObj) {
      this.currentSortLabel = currentSortObj.label;
    }
    this.doSearch();
  }

  searchTextUpdated() {
    this.config.currentPage = 1;
    this.doSearch();
  }

  onChangeFilters() {
    this.config.currentPage = 1;
  }

  doSearch() {
    // extending class needs to override this to dispatch a search action
  }

  doSort() {
    this.columnsToSortBy = this.columnsToSortBy.map((col) => {
      const newCol = { ...col };
      newCol.dir = this.currentSortDirection === 'DESC' ? 'ASC' : 'DESC';
      if (col.def === this.currentSort) {
        this.currentSortLabel = col.label;
      }
      return newCol;
    });
    this.doSearch();
  }

  getSummaryString(configId?: string) {
    let showNum = Number(this.showEntriesSelection);
    if (configId === 'loadWildfiresPaginator') {
      showNum = 10;
    }
    if (
      this.collection?.totalRowCount &&
      this.collection?.totalRowCount > 0
    ) {
      let start = (this.collection.pageNumber - 1) * showNum + 1;
      let end = start + showNum - 1;
      const total = this.collection.totalRowCount
        ? this.collection.totalRowCount
        : 0;

      if (start < 0) {
        start = 0;
      }
      if (end < 0) {
        end = 0;
      }
      if (end > total) {
        end = total;
      }
      return `Showing ${start} to ${end} of ${total}`;
    } else {
      return this.CONSTANTS.NO_RECORDS_MESSAGE;
    }
  }

  selectFilterUpdated(property, value) {
    this[property] = value;
    this.cdr.detectChanges();
    this.onChangeFilters();
  }

  selectShowEntriesUpdated(property, value) {
    this[property] = value;
    this.onShowEntriesChange();
  }

  selectSortParamUpdated(property, value) {
    this[property] = value;
    this.doSort();
  }

  //click and enter key handling for item level action (support for accessibility)
  defaultItemClickAction(item) {
    if (this.defaultItemActionPermitted(item)) {
      this.doDefaultItemAction(item);
    }
  }

  defaultItemKeyEnterAction(event, item) {
    const enterKey = 'Enter';
    const spaceKey = ' ';
    if (
      this.defaultItemActionPermitted(item) &&
      (event.key === enterKey || event.key === spaceKey)
    ) {
      this.doDefaultItemAction(item);
    }
  }

  defaultItemActionPermitted(item) {
    return false; //implementing classes need to override if they have a item level action
  }

  doDefaultItemAction(item) {
    return; //implementing classes need to override if they have a item level action
  }
}
