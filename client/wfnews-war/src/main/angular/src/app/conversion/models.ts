export interface PagedCollection {
    pageNumber?: number;
    pageRowCount?: number;
    totalRowCount?: number;
    totalPageCount?: number;
    collection?: Array<any>;
}

export interface fireCentreOption {
    code?: string;
    fireCentreName?: string;
}