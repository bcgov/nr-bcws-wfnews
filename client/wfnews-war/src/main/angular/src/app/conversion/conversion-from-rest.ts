import { HttpErrorResponse } from '@angular/common/http';
import { UUID } from 'angular2-uuid';
import { ErrorState, ERROR_TYPE } from '../store/application/application.state';

export function convertToErrorState(error: Error, resourceName?: string): ErrorState {
    if (!error) {
        return null;
    }
    if (error instanceof HttpErrorResponse || error.name == 'HttpErrorResponse') {
        const err = error as HttpErrorResponse;
        if (err.status == 404) {
            return {
                uuid: UUID.UUID(),
                type: ERROR_TYPE.NOT_FOUND,
                status: err.status,
                statusText: err.statusText,
                message: resourceName ? `${resourceName} not found` : err.message,
                name: err.name,
                responseEtag: err.headers.get('ETag'),
            };
        }
        if (err.status == 412) {
            return {
                uuid: UUID.UUID(),
                type: ERROR_TYPE.FAILED_PRECONDITION,
                status: err.status,
                statusText: err.statusText,
                message: resourceName ? `${resourceName} has changed since last retrieve` : err.message,
                name: err.name,
                responseEtag: err.headers.get('ETag'),
            };
        }

        if (err.status >= 500 || err.status == 0) {
            return {
                uuid: UUID.UUID(),
                type: ERROR_TYPE.FATAL,
                status: err.status,
                statusText: err.statusText,
                message: resourceName ? `Unexpected error performing operation on ${resourceName}` : err.message,
                name: err.name,
                responseEtag: undefined,
            };
        }

        return {
            uuid: UUID.UUID(),
            type: err.status == 400 ? ERROR_TYPE.VALIDATION : (err.status == 409 ? ERROR_TYPE.WARNING : ERROR_TYPE.FATAL),
            status: err.status,
            statusText: err.statusText,
            message: err.status == 400 ? 'Validation Error' : (err.status == 409 ? 'Warning' : err.message),
            name: err.name,
            validationErrors: err.error.messages,
            responseEtag: err.headers.get('ETag'),
        };
    } else {
        throw error;
    }

}
