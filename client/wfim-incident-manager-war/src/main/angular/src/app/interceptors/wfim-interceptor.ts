import { Injectable, Injector } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpHeaders,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService, AuthenticationInterceptor, TokenService, } from "@wf1/core-ui";
import { UUID } from "angular2-uuid";
import { catchError, mergeMap, tap } from "rxjs/operators";
import { UIReportingService } from "../services/ui-reporting.service";
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class WfimInterceptor extends AuthenticationInterceptor implements HttpInterceptor {
    private tokenService;
    private asyncTokenRefresh;
    private refreshSnackbar;
    private sRofPollingErrorCount = 0;
    private sRofPollingThreshold = 10;
    constructor(protected appConfig: AppConfigService,
        private snackbarService: MatSnackBar,
        private uiReportingService: UIReportingService,
        protected injector: Injector) {
        super(injector);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let processedRequest = req;
        let requestId;
        if (this.isUrlSecured(req.url)) {
            requestId = `WFIMUI${UUID.UUID().toUpperCase()}`.replace(/-/g, '');
            if (!this.tokenService) {
                this.tokenService = this.injector.get(TokenService);
            }

            if (this.tokenService.getTokenDetails()) {
                if (this.tokenService.isTokenExpired(this.tokenService.getTokenDetails())) {
                    //console.log("exp token adding auth header");

                    return this.refreshWindow().pipe(mergeMap((tokenResponse) => {
                        this.tokenService.updateToken(tokenResponse);
                        const headers = new HttpHeaders({
                            'Authorization': `Bearer ${tokenResponse['access_token']}`,
                            'RequestId': requestId
                        });

                        processedRequest = req.clone({ headers });
                        if (this.asyncTokenRefresh.isComplete) {
                            this.asyncTokenRefresh = undefined;
                        }
                        if (this.refreshSnackbar) {
                            this.refreshSnackbar.dismiss();
                            this.refreshSnackbar = undefined;
                        }
                        return this.handleRequest(requestId, next, processedRequest);
                    }));
                } else {
                    if (requestId) {
                        let headers = req.headers.set('RequestId', requestId)
                            .set('Authorization', `Bearer ${this.tokenService.getOauthToken()}`);

                        processedRequest = req.clone({ headers });
                    }
                    return this.handleRequest(requestId, next, processedRequest);
                }
            } else {
                return this.handleRequest(requestId, next, processedRequest);
            }
        } else {
            return this.handleRequest(requestId, next, processedRequest);
        }
    }

    handleRequest(requestId, next, processedRequest): Observable<any> {
        return next.handle(processedRequest).pipe(
            tap((response: HttpResponse<any>) => {
                if (response && response.url && response.url.indexOf('simpleReportOfFires?') > -1) {
                    if (this.sRofPollingErrorCount > 0) {
                        console.log(`Success reset threshold on simple rof. Count was at ${this.sRofPollingErrorCount}`);
                        this.sRofPollingErrorCount = 0;
                    }
                }
            }
            ),
            catchError((response: HttpErrorResponse) => {
                //console.log("interceptor error handler", response);
                if (response.url && (response.url.endsWith('codeTables') || response.url.endsWith('codeHierarchies'))) {
                    this.uiReportingService.displayErrorMessage(`Unable to initialize application (${response.status}). ${response.url}`);
                } else if (response.status === 0) {
                    this.uiReportingService.displayErrorMessage('An unexpected error has occurred. Status(0)');
                } else if (response.status >= 500) {
                    if ( response.url && response.url.indexOf('simpleReportOfFires?') > -1) {
                        this.evaluatePollingError(response, requestId);
                    }
                    else if ( response.url && response.url.includes( 'userPrefs.jsp' ) &&
                            response.error && (
                                response.error.includes( 'PreconditionFailedException' ) ||
                                response.error.includes( 'Internal Server Error' ) ||
                                response.error.includes( 'ConflictException' )
                            )
                    ) {
                        // dont show snackbar, this error is ignored for now
                        console.warn( response )
                    }
                    else if ( response.url && response.url.includes( 'publicReportOfFires' ) ) {
                        // dont show snackbar, this error is ignored for now
                        console.warn( response )
                    }
                    else {
                        this.uiReportingService.displayErrorMessage(requestId ? `Server Error (${response.status}). RequestId: ${requestId}` : `Server Error (${response.status})`);
                    }
                } else if (response.status == 401 || response.status == 403) {
                    this.uiReportingService.displayErrorMessage(`Insufficient Permissions (${response.status}). ${response.url}`);
                } else if (response.status == 404) {
                    if (response.url && response.url.indexOf('simpleReportOfFires?') > -1) {
                        this.evaluatePollingError(response, requestId);
                    }
                }
                throw response;
            }))
    }

    evaluatePollingError(response: HttpErrorResponse, requestId) {
        this.sRofPollingErrorCount++;
        console.log(`Simple Report of Fire Error(${response.status}: Error Count: ${this.sRofPollingErrorCount} with threshold count of ${this.sRofPollingThreshold}`);
        if (this.sRofPollingErrorCount >= this.sRofPollingThreshold) {
            this.uiReportingService.displayErrorMessage(requestId ? `Error Fetching Updates threshold exceeded (${response.status}). RequestId: ${requestId}` : `Error Fetching Updates threshold exceeded  (${response.status})`);
            this.sRofPollingErrorCount = 0;
        }
    }

    refreshWindow() {
        if (this.asyncTokenRefresh) {
            return this.asyncTokenRefresh;
        }
        let baseUrl = this.appConfig.getConfig().application.baseUrl;
        let refreshPage = 'refresh-token.html';
        if (baseUrl && !baseUrl.endsWith('/')) {
            refreshPage = `/${refreshPage}`
        }

        let authorizeUrl = this.appConfig.getConfig().webade.oauth2Url;
        let clientId = this.appConfig.getConfig().webade.clientId;
        let authScopes = this.appConfig.getConfig().webade.authScopes;

        let redirectUrl = `${baseUrl}${refreshPage}`;
        this.asyncTokenRefresh = this.tokenService.initRefreshTokenImplicitFlow(`${authorizeUrl}?response_type=token&client_id=${clientId}&redirect_uri=${redirectUrl}&scope=${authScopes}`
            , 'wfim-incidents-token',
            (errorMessage) => {
                this.displayRefreshErrorMessage(errorMessage);
            });
        return this.asyncTokenRefresh;

    }

    public displayRefreshErrorMessage(message: string) {
        if (!this.refreshSnackbar) {
            this.refreshSnackbar = this.snackbarService.open(message, 'OK', { duration: 0, panelClass: 'snackbar-error' });

            this.refreshSnackbar.onAction().subscribe(() => {
                this.refreshSnackbar.dismiss();
                this.refreshSnackbar = undefined;
            });
        }
    }

    isUrlSecured(url: string): boolean {
        let isSecured = false;
        let config = this.appConfig.getConfig();
        //console.log(url);
        if (config && url == config['userPreferences']['preferencesUrl']) {
            isSecured = true;
            //console.log(url, "is secured");

        }
        if (config && config.rest) {
            for (let endpoint in config.rest) {
                if (url.startsWith(config.rest[endpoint])) {
                    isSecured = true;
                    break;
                }
            }
        }
        return isSecured;
    }
}
