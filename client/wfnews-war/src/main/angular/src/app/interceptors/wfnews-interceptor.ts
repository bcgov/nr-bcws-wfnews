import {Injectable, Injector} from "@angular/core";
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {AppConfigService, AuthenticationInterceptor, TokenService} from "@wf1/core-ui";
import {UUID} from "angular2-uuid";
import {catchError, filter, mergeMap, switchMap, take} from "rxjs/operators";
import {Router} from "@angular/router";
import {RouterExtService} from "../services/router-ext.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { ErrorHandlingInstructions } from "../utils/user-feedback-utils";
import { ApplicationStateService } from "../services/application-state.service";
import { ResourcesRoutes } from "../utils";

@Injectable()
export class WfnewsInterceptor extends AuthenticationInterceptor implements HttpInterceptor {
    private tokenService;
    private asyncTokenRefresh;
    private refreshSnackbar;

    constructor(protected appConfig: AppConfigService, private snackbarService: MatSnackBar, protected injector: Injector,
                private router: Router, private routerExtService: RouterExtService) {
        super(injector);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let processedRequest = req;
        let requestId;
        requestId = `WFNEWSUI${UUID.UUID().toUpperCase()}`.replace(/-/g, "");

        if (this.isUrlSecured(req.url)) {
            if (!this.tokenService) {
                this.tokenService = this.injector.get(TokenService);
            }
            return this.handleLogin(req, next, this.tokenService, requestId);

        } else {
            return this.handleRequest(requestId, next, processedRequest);
        }
    }

    handleLogin(req: HttpRequest<any>, next: HttpHandler, tokenService: TokenService, requestId: string): Observable<any> {
        let processedRequest = req;

        return tokenService.authTokenEmitter.pipe(
            filter(token => token != null)
            , take(1)
            , switchMap(token => {
                if (this.tokenService.getTokenDetails()) {
                    let appStateService = this.injector.get(ApplicationStateService);
                    if (!appStateService.isAdminPageAccessable()){
                        this.router.navigate([ResourcesRoutes.ERROR_PAGE])
                    }
                    if (this.tokenService.isTokenExpired(this.tokenService.getTokenDetails())) {
                        return this.refreshWindow().pipe(mergeMap((tokenResponse) => {
                            this.tokenService.updateToken(tokenResponse);
                            let headers = req.headers.set("Authorization", `Bearer ${tokenResponse["access_token"]}`)
                                .set("RequestId", requestId);

                            processedRequest = req.clone({headers});
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
                            let authToken = this.tokenService.getOauthToken();
                            processedRequest = req.clone({
                                headers: req.headers.set('Authorization', 'Bearer ' + authToken).set("RequestId", requestId).set("Accept", "*/*")
                                .set("Cache-Control", "no-cache")
                                    .set("Pragma", "no-cache")
                            });
                        }
                        return this.handleRequest(requestId, next, processedRequest);
                    }
                } else {
                    return this.handleRequest(requestId, next, processedRequest);
                }
            }));
    }

    handleRequest(requestId, next, processedRequest): Observable<any> {
        return next.handle(processedRequest).pipe(
            catchError((response: HttpErrorResponse) => {
                const errorHandlingInstructions = this.retrieveErrorHandlingInstructions(response, processedRequest, requestId);
                this.handleError(errorHandlingInstructions);
                throw response;
            }));
    }


    retrieveErrorHandlingInstructions(response, processedRequest, requestId): ErrorHandlingInstructions {
        console.log("ERROR HANDLE", response, processedRequest);
        if (response.url && response.url.endsWith("codeTables")) {
            return this.createErrorHandlingInstructions(null, null, `Unable to initialize application (${response.status}). ${response.url}`);
        } else if (response.status === 0) {
            if (window.navigator.onLine) {
                return this.createErrorHandlingInstructions(null, null, "An unexpected error has occurred.");
            } else {
                return this.createErrorHandlingInstructions(null, null, "No Connectivity. Please try again when you have reconnected.");
            }
        } else if (response.status === 504) {
            return this.createErrorHandlingInstructions(null, null, "No Connectivity. Please try again when you have reconnected.");
        } else if (response.status === 500) {
            let message = "";
            if (response.error && response.error.messages && response.error.messages.length > 0
                && response.error.messages[0].message) {
                    message = 'Error 500: ' + response.error.messages[0].message;
            } else {
                message = requestId ? `Server Error (500). RequestId: ${requestId}` : "Server Error (500)";
            }

            return this.createErrorHandlingInstructions(null,
                null,
                message);

        } else if (response.status >= 501) {
            return this.createErrorHandlingInstructions(null, null, `Server Error (${response.status}).`);
        } else if (response.status == 401) {
            let message = "";
            if (response.error && response.error.messages && response.error.messages.length > 0
                && response.error.messages[0].message) {
                    message = 'Insufficient Permissions: ' + response.error.messages[0].message;
            } else {
                message = `Insufficient Permissions (${response.status}). ${response.url}`;
            }

            return this.createErrorHandlingInstructions(null,
                null,
                message);
        } else if (response.status == 403) {
            let message = "";
            if (response.error && response.error.messages && response.error.messages.length > 0
                && response.error.messages[0].message) {
                    message = 'Insufficient Permissions: ' + response.error.messages[0].message;
            } else {
                message = `Insufficient Permissions (${response.status}). ${response.url}`;
            }

            return this.createErrorHandlingInstructions(null,
                null,
                message);

        }

        return null;
    }

    handleError(errorHandlingInstructions: ErrorHandlingInstructions) {
        if (!errorHandlingInstructions) {
            return;
        }

        if (errorHandlingInstructions.redirectToRoute) {
            this.router.navigate([errorHandlingInstructions.redirectToRoute], {queryParams: {message: errorHandlingInstructions.redirectToRouteData}});
        }
    }


    createErrorHandlingInstructions(redirectToRoute, redirectToRouteData, snackBarErrorMsg): ErrorHandlingInstructions {
        return {
            redirectToRoute: redirectToRoute,
            redirectToRouteData: redirectToRouteData,
            snackBarErrorMsg: snackBarErrorMsg
        };

    }

    updateErrorPageRouteData(routeName, data) {
        let route = this.router.config.find(r => r.path === routeName);
        if (data) {
            route.data = {errorMsg: data};
        }
    }

    isUrlSecured(url: string): boolean {
        let isSecured = false;
        const config = this.appConfig.getConfig();
        if (config && config.rest) {
            let wfdmProxy = config.externalAppConfig['wfdmProxy'];
            if(url.startsWith(wfdmProxy.toString())) {
                return true; // if the request is from Document Service proxy
            }
            if (url.startsWith(config.rest['wfnews']) || url.includes('wfss-pointid-api')) {
                return false; // if the request is from wfnews-server, no need to hanldeLogin
            }
            for (let endpoint in config.rest) {
                if (url.startsWith(config.rest[endpoint])) {
                    isSecured = true;
                    break;
                }
            }
        }
        return isSecured;
    }

    displayRefreshErrorMessage(message: string) {
      // unused. Why is this empty?
    }

    refreshWindow() {
        if (this.asyncTokenRefresh) {
            return this.asyncTokenRefresh;
        }
        let baseUrl = this.appConfig.getConfig().application.baseUrl;
        let refreshPage = "refresh-token.html";
        if (baseUrl && !baseUrl.endsWith("/")) {
            refreshPage = `/${refreshPage}`;
        }
        let clientId = this.appConfig.getConfig().webade.clientId;
        let authorizeUrl = this.appConfig.getConfig().webade.oauth2Url;
        let authScopes = this.appConfig.getConfig().webade.authScopes;

        let redirectUrl = `${baseUrl}${refreshPage}`;
        this.asyncTokenRefresh = this.tokenService.initRefreshTokenImplicitFlow(`${authorizeUrl}?response_type=token&client_id=${clientId}&redirect_uri=${redirectUrl}&scope=${authScopes}`
            , "wfim-incidents-token",
            (errorMessage) => {
                this.displayRefreshErrorMessage(errorMessage);
            });
        return this.asyncTokenRefresh;

    }
}
