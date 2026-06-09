import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AppConfigService } from '@wf1/core-ui';

@Injectable()
export class WfimEtagInterceptor implements HttpInterceptor {

  constructor(private appConfig: AppConfigService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const config = this.appConfig.getConfig();
    const incidentsUrl = config && config.rest ? config.rest['incidents'] : null;
    
    // Only intercept modifying requests destined for the WFIM API
    if (incidentsUrl && (request.method === 'PUT' || request.method === 'POST' || request.method === 'DELETE') && request.url.startsWith(incidentsUrl)) {
      
      const etag = request.body && typeof request.body === 'object' ? (request.body['etag'] || request.body['@etag']) : null;
      const hasValidIfMatch = request.headers.has('If-Match') && request.headers.get('If-Match') !== '[object Object]';

      if (hasValidIfMatch) {
         return next.handle(request);
      }

      if (etag) {
        const cloned = request.clone({
          headers: request.headers.set('If-Match', String(etag))
        });
        return next.handle(cloned);
      }
      
      // If no ETag is available, but this is a PUT or DELETE request, we MUST fetch it 
      // (because list endpoints strip ETags, rendering optimistic locking impossible from UI)
      if (!etag && (request.method === 'PUT' || request.method === 'DELETE')) {
         const getRequest = request.clone({ method: 'GET', body: null });
         
         return next.handle(getRequest).pipe(
            filter((event: HttpEvent<any>) => event instanceof HttpResponse),
            switchMap((response: any) => {
               const fetchedEtag = response.headers?.get('ETag') || response.body?.['@etag'] || response.body?.['etag'];
               
               if (fetchedEtag) {
                  let newBody = request.body;
                  // Some endpoints also require the ETag inside the JSON body itself
                  if (request.method === 'PUT' && request.body && typeof request.body === 'object') {
                     newBody = { ...request.body, etag: fetchedEtag };
                  }
                  
                  const cloned = request.clone({
                    body: newBody,
                    headers: request.headers.set('If-Match', String(fetchedEtag))
                  });
                  return next.handle(cloned);
               }
               
               // Fallback if ETag still isn't found
               return next.handle(request);
            })
         );
      }
    }
    
    return next.handle(request);
  }
}
