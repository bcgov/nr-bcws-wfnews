import { Injectable, Injector } from '@angular/core';
import { TokenService } from '@wf1/core-ui';
import { WfDevice } from '@wf1/wfcc-application-ui';
import { ROLES_UI } from '../shared/scopes/scopes';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStateService {
  tokenService: TokenService;
  private weatherHistoryOptions: WeatherHistoryOptions = {
    historyLength: 72,
    chartDataSources: [
      {
        property: 'temp',
        title: 'Temperature',
      },
      {
        property: 'relativeHumidity',
        title: 'Relative Humidity',
      },
    ],
    includedSources: [],
  };

  constructor(
    private injector: Injector,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  getDevice(): WfDevice {
    if (
      window.innerWidth < 768 ||
      (window.innerWidth >= 768 && window.innerHeight < 450)
    ) {
      return 'mobile';
    }

    return 'desktop';
  }

  getOrientation(): 'landscape' | 'portrait' {
    if (window.innerWidth > window.innerHeight) {
      return 'landscape';
    }

    return 'portrait';
  }

  private checkMobileResolution() {
    if (
      window.innerWidth < 768 ||
      (window.innerWidth < 900 &&
        window.innerHeight < 450) /*support for landscape mobile views*/
    ) {
      return true;
    } else {
      return false;
    }
  }

  public getIsMobileResolution(): boolean {
    return this.checkMobileResolution();
  }

  public doesUserHaveScopes(scopes: string[]): boolean {
    return this.getTokenService().doesUserHaveApplicationPermissions(scopes);
  }

  public getUserCredentialsEmitter() {
    return this.getTokenService().credentialsEmitter;
  }

  public getUserDetails() {
    return this.getTokenService()
      ? this.getTokenService().getTokenDetails()
      : null;
  }

  private getTokenService() {
    return this.tokenService
      ? this.tokenService
      : this.injector.get(TokenService);
  }

  public isAdminPageAccessable(): boolean {
    return (
      this.doesUserHaveScopes([ROLES_UI.ADMIN]) ||
      this.doesUserHaveScopes([ROLES_UI.IM_ADMIN])
    );
  }

  public getWeatherHistoryOptions(): WeatherHistoryOptions {
    return this.weatherHistoryOptions;
  }

  public setWeatherHistoryOptions(opt: WeatherHistoryOptions) {
    return (this.weatherHistoryOptions = opt);
  }
}

export interface WeatherHistoryOptions {
  historyLength: number; // hours
  chartDataSources: {
    property: string;
    title: string;
  }[];
  includedSources: {
    property: string;
  }[];
}
