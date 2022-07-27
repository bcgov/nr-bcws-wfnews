import { Injectable } from '@angular/core';
import { WfDevice } from '@wf1/wfcc-application-ui';
import { ROLES_UI } from '../shared/scopes/scopes';

@Injectable({
    providedIn: 'root'
})
export class ApplicationStateService {
    constructor(
    ) {}

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



}
