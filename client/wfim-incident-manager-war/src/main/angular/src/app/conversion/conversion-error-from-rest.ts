import {HttpErrorResponse} from "@angular/common/http";
import {WFError} from "../modules/core/models/wf-error";

export function convertToWFErrors(error):WFError[]{
  if(!error || !(error instanceof HttpErrorResponse || error.name == 'HttpErrorResponse')) {
    return [{
      status: 0,
      message: "An unknown error occurred",
      messageArguments: [],
      messageTemplate: "error.unknown",
      path: ""
    }];
  }else {
    let httpError = error as HttpErrorResponse;
    let errorsArray:WFError[];
    let etag = undefined;
    if (httpError.error && httpError.error.errors) {
      errorsArray = httpError.error.errors.map(err => {
        let incErr:WFError = {...err, status:httpError.status};
        return incErr;
      });
    }else{
      let msg = httpError.message;
      if(httpError.status >= 500){
        msg = `Server Error (${httpError.status})`;
      }else if(httpError.status == 401 || httpError.status == 403){
        msg = `Insufficient Permissions (${httpError.status}). ${httpError.url}`;
      }else if(httpError.status == 404){
        msg = `Not Found (${httpError.status}). ${httpError.url}`;
      }else if(httpError.status == 412){
        etag = httpError.headers.get("ETag");
      }
      errorsArray = [{
        status: httpError.status,
        message: msg,
        messageArguments: [],
        messageTemplate: "",
        path: "",
        responseEtag:etag
      }];
    }

    return errorsArray;
  }

}
