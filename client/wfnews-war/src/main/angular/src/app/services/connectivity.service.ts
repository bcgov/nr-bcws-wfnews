import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { AppConfigService } from '@wf1/core-ui';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Reaches the network: the WFNEWS API check, and GET requests that must work on the phone. */
@Injectable({
  providedIn: 'root',
})
export class ConnectivityService {
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  pingService(): Observable<any> {
    const url = this.appConfigService.getConfig().rest['wfnews'];
    return this.http.get(url);
  }

  async checkOnlineStatus(): Promise<boolean> {
    try {
      await this.pingService().toPromise();
      return true;
    } catch (error) {
      return false;
    }
  }

  getRequest<T>(url: string): Observable<T> {
    if (Capacitor.isNativePlatform()) {
      return from(CapacitorHttp.request({
        method: 'GET',
        url: encodeURI(url),
        headers: {
          accept: '*/*',
        }
      })).pipe(
        map(response => response.data)
      );
    } else {
      return this.http.get<T>(encodeURI(url));
    }
  }
}
