export interface PagingInfoRequest {
    query?: string;
    pageNumber: number;
    pageRowCount: number;
    sortColumn?: string;
    sortDirection?: string;
}

export interface ErrorState {
    uuid: string;
    type: ERROR_TYPE;
    status: number;
    statusText?: string;
    message?: string;
    name: string;
    validationErrors?: ValidationError[];
    responseEtag: string;
}

export enum ERROR_TYPE {
    VALIDATION,
    WARNING,
    FATAL,
    NOT_FOUND,
    FAILED_PRECONDITION
}

export interface ValidationError {
    path: string;
    message: string;
    messageTemplate: string;
    messageArguments: any[];
}
