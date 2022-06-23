import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppConfigService, TokenService } from '@wf1/core-ui';
import { WfApplicationConfiguration, WfApplicationState } from '@wf1/wfcc-application-ui';
import { ApplicationStateService } from '../../../../services/application-state.service';
import { RootState } from '../../../../store';

@Component({
    selector: 'wf1-im-container',
    templateUrl: './im-container.component.html',
    styleUrls: ['./im-container.component.scss']
})
export class IMContainerComponent implements OnInit {

    hasAuth: boolean = false;

    applicationConfig: WfApplicationConfiguration = {
        title: 'INCIDENT MANAGEMENT',
        device: null,
        userName: '',
        version: {
            long: '',
            short: ''
        },
        environment: ''
    }

    applicationState: WfApplicationState = {
        menu: 'hidden'
    }

    constructor(
        private store: Store<RootState>,
        private applicationStateService: ApplicationStateService,
        protected appConfigService: AppConfigService,
        protected tokenService: TokenService,
    ) { }

    ngOnInit() {
        this.store.pipe( select('auth', 'token') ).subscribe( token => this.hasAuth = Boolean(token) )

        this.applicationConfig.device = this.applicationStateService.getDevice()

        this.appConfigService.configEmitter.subscribe( (config) => {
            this.applicationConfig.environment = config.application.environment.replace(/^.*prod.*$/i, '')
        } )

        this.tokenService.credentialsEmitter.subscribe( (creds) => {
            let first = creds.given_name || creds.givenName
            let last = creds.family_name || creds.familyName

            this.applicationConfig.userName = `${ first } ${ last }`
        } )

        window[ 'SPLASH_SCREEN' ].remove()
    }

}
