import { Injectable } from '@angular/core';
import { TokenService } from "@wf1/core-ui";
import { WfDevice } from '@wf1/wfcc-application-ui';
import { ROLES_UI } from "../shared/scopes/scopes";

@Injectable({
    providedIn: 'root'
})
export class ApplicationStateService {
    constructor(
        private tokenService: TokenService
    ) {}

    getDevice(): WfDevice {
        if ( window.innerWidth < 768 || ( window.innerWidth >= 768 && window.innerHeight < 450 ) ) return 'mobile'

        return 'desktop'
    }

    getOrientation(): 'landscape'|'portrait' {
        if ( window.innerWidth > window.innerHeight ) return 'landscape'

        return 'portrait'
    }

    isGeneralStaff(): boolean {
        return this.doesUserHaveScopes( [ ROLES_UI.GENERAL_STAFF ] )
    }

    doesUserHaveScopes( scopes: string[] ): boolean {
        const tokenDetails = this.tokenService.getTokenDetails()

        if ( !tokenDetails?.scope?.length ) return false

        return scopes.every( s => tokenDetails.scope.includes( s ) )
    }

}
