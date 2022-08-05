export interface PagedCollection {
    pageNumber?: number;
    pageRowCount?: number;
    totalRowCount?: number;
    totalPageCount?: number;
    collection?: Array<any>;
}