import { Injectable, Injector } from '@angular/core';
import { TokenService} from '@wf1/core-ui';
import { WfDevice } from '@wf1/wfcc-application-ui';
import { ROLES_UI } from '../shared/scopes/scopes';

@Injectable({
    providedIn: 'root'
})
export class ApplicationStateService {

    tokenService: TokenService;

    constructor(private injector: Injector
    ) {

    }

    getDevice(): WfDevice {
        if ( window.innerWidth < 768 || ( window.innerWidth >= 768 && window.innerHeight < 450 ) ) {
return 'mobile';
}

        return 'desktop';
    }

    getOrientation(): 'landscape'|'portrait' {
        if ( window.innerWidth > window.innerHeight ) {
return 'landscape';
}

        return 'portrait';
    }

    private checkMobileResolution() {
        if (window.innerWidth < 768 || (window.innerWidth < 900 && window.innerHeight < 450)/*support for landscape mobile views*/) {
            return true;
        } else {
            return false;
        }
    }

    public getIsMobileResolution(): boolean {
        return this.checkMobileResolution();
    }

    public doesUserHaveScopes(scopes: string[]): boolean {
        return this.getTokenService().doesUserHaveApplicationPermissions(
            scopes);
    }

    public getUserCredentialsEmitter() {
        return this.getTokenService().credentialsEmitter;
    }

    public getUserDetails() {
        return this.getTokenService() ? this.getTokenService().getTokenDetails() : null;
    }

    private getTokenService() {
        return this.tokenService ? this.tokenService : this.injector.get(TokenService);
    }

    public isAdminPageAccessable(): boolean {
      return this.doesUserHaveScopes([ROLES_UI.ADMIN]) || this.doesUserHaveScopes([ROLES_UI.IM_ADMIN])
    }

}
