# Internet Connection Monitoring Service (Angular v7)

> Detects whether browser has an active internet connection or not in Angular application.

This library is a fork of https://github.com/ultrasonicsoft/ng-connection-service by Balram Chavan.

## Install

```ts
npm i ngx-connection-service --save
```

## Angular Version Compatibility

Please use following table to determine suitable library version for your Angular project.

| *ngx-connection-service version* | *Angular version* |
| --- | --- |
| 7.0.x | 7.2.16 |


## Usage

- Import `ConnectionServiceModule` in your `app.module.ts`.

```ts
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {ConnectionServiceModule} from 'ngx-connection-service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ConnectionServiceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

- Inject `ConnectionService` in your component's constructor.
- Subscribe to `monitor()` method to get push notification whenever internet connection status is changed.

```ts
import { Component } from '@angular/core';
import { ConnectionService } from 'ngx-connection-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  hasNetworkConnection: boolean;
  hasInternetAccess: boolean;
  status: string;

  constructor(private connectionService: ConnectionService) {
    this.connectionService.monitor().subscribe(currentState => {
      this.hasNetworkConnection = currentState.hasNetworkConnection;
      this.hasInternetAccess = currentState.hasInternetAccess;
      if (this.hasNetworkConnection && this.hasInternetAccess) {
        this.status = 'ONLINE';
      } else {
        this.status = 'OFFLINE';
      }
    });
  }
}

```

## Configuration

You can configure the service using `ConnectionServiceOptions` configuration variable.
Following options are available;

```ts
/**
 * Instance of this interface could be used to configure "ConnectionService".
 */
export interface ConnectionServiceOptions {
  /**
   * Controls the Internet connectivity heartbeat system. Default value is 'true'.
   */
  enableHeartbeat?: boolean;
  /**
   * Url used for checking Internet connectivity, heartbeat system periodically makes "HEAD" requests to this URL to determine Internet
   * connection status. Default value is "//server.test-cors.org".
   */
  heartbeatUrl?: string;
  /**
   * Callback function to used for executing heartbeat requests. Defaults to HttpClient.request(...) function.
   */
  heartbeatExecutor?: (options?: ConnectionServiceOptions) => Observable<any>;
  /**
   * Interval used to check Internet connectivity specified in milliseconds. Default value is "30000".
   */
  heartbeatInterval?: number;
  /**
   * Interval used to retry Internet connectivity checks when an error is detected (when no Internet connection). Default value is "1000".
   */
  heartbeatRetryInterval?: number;
  /**
   * HTTP method used for requesting heartbeat Url. Default is 'head'.
   */
  requestMethod?: 'get' | 'post' | 'head' | 'options';

}
```

You should define a provider for `ConnectionServiceOptionsToken` in your module as follows;

```ts
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {ConnectionServiceModule, ConnectionServiceOptions, ConnectionServiceOptionsToken} from 'ngx-connection-service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ConnectionServiceModule
  ],
  providers: [
    {
      provide: ConnectionServiceOptionsToken,
      useValue: <ConnectionServiceOptions>{
        enableHeartbeat: false,
        heartbeatUrl: '/assets/ping.json',
        requestMethod: 'get',
        heartbeatInterval: 3000
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

```

### Custom HeartBeat handling function

You could use a callback function for handling heartBeat requests by defining `heartbeatExecutor` property in `ConnectionServiceOptions`;

```ts
import { Component } from '@angular/core';
import { ConnectionService } from 'ngx-connection-service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  hasNetworkConnection: boolean;
  hasInternetAccess: boolean;
  status: string;

  constructor(private connectionService: ConnectionService) {

    this.connectionService.updateOptions({
      heartbeatExecutor: options => new Observable<any>(subscriber => {
        if (Math.random() > .5) {
          subscriber.next();
          subscriber.complete();
        } else {
          throw new Error('Connection error');
        }
      })
    });

    this.connectionService.monitor().subscribe(currentState => {
      this.hasNetworkConnection = currentState.hasNetworkConnection;
      this.hasInternetAccess = currentState.hasInternetAccess;
      if (this.hasNetworkConnection && this.hasInternetAccess) {
        this.status = 'ONLINE';
      } else {
        this.status = 'OFFLINE';
      }
    });
  }
}

```

## License

[MIT License](https://github.com/yildiraymeric/ngx-connection-service/blob/master/LICENSE) © M. Yıldıray Meriç & Balram Chavan (orginal work)
