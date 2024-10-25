import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { isMobileView,EventTypes, Types } from '@app/utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceRedirectGuard implements CanActivate {
  public isMobileView = isMobileView;

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Split the URL into path and query string
    const [path, queryString] = state.url.split('?');
    const queryParams = new URLSearchParams(queryString || '');

    if (isMobileView() && path.includes('events')) {
      // Perform query parameter transformations
      this.transformQueryParams(queryParams);

      return this.router.parseUrl(`full-details?${queryParams.toString()}`);
    }

    if (!isMobileView() && path.includes('full-details')) {
      this.reverseTransformQueryParams(queryParams);
      return this.router.parseUrl(`events?${queryParams.toString()}`);
    }

    // If conditions are met, allow the route to activate
    return true;
  }

  // Function to handle query parameter transformations
  private transformQueryParams(queryParams: URLSearchParams): void {
    const eventType = queryParams.get('eventType');

    switch (eventType) {
      case EventTypes.ORDER:
        queryParams.set('type', Types.EVAC_ORDER);
        break;
      case EventTypes.ALERT:
        queryParams.set('type', Types.EVAC_ALERT);
        break;
      case EventTypes.AREA_RESTRICTION:
        queryParams.set('type', Types.AREA_RESTRICTION);
        this.renameQueryParams(queryParams, 'eventNumber', 'id');
        this.renameQueryParams(queryParams, 'eventName', 'name');
        break;
      case EventTypes.BAN:
        queryParams.set('type', Types.BANS_PROHIBITIONS);
        this.renameQueryParams(queryParams, 'eventNumber', 'id');
        break;
      case EventTypes.DANGER_RATING:
        queryParams.set('type', Types.DANGER_RATING);
        this.renameQueryParams(queryParams, 'eventNumber', 'sysid');
        this.renameQueryParams(queryParams, 'eventName', 'id');
        break;
      default:
        break;
    }
  }

  private reverseTransformQueryParams(queryParams: URLSearchParams): void {
    const type = queryParams.get('type');

    switch (type) {
      case Types.EVAC_ORDER:
        queryParams.set('eventType', EventTypes.ORDER);
        break;
      case Types.EVAC_ALERT:
        queryParams.set('eventType', EventTypes.ALERT);
        break;
      case Types.AREA_RESTRICTION:
        queryParams.set('eventType', EventTypes.AREA_RESTRICTION);
        this.renameQueryParams(queryParams, 'id', 'eventNumber');
        this.renameQueryParams(queryParams, 'name', 'eventName');
        break;
      case Types.BANS_PROHIBITIONS:
        queryParams.set('eventType', EventTypes.BAN);
        this.renameQueryParams(queryParams, 'id', 'eventNumber');
        break;
      case Types.DANGER_RATING:
        queryParams.set('eventType', EventTypes.DANGER_RATING);
        this.renameQueryParams(queryParams, 'sysid', 'eventNumber');
        this.renameQueryParams(queryParams, 'id', 'eventName');
        break;
      default:
        break;
    }
  }

  // Helper function to rename query parameters
  private renameQueryParams(queryParams: URLSearchParams, oldKey: string, newKey: string): void {
    const value = queryParams.get(oldKey);
    if (value) {
      queryParams.set(newKey, value);
      queryParams.delete(oldKey);
    }
  }
}
