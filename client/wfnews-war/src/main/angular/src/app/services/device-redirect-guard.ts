import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { isMobileView } from '@app/utils';
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
      case 'Order':
        queryParams.set('type', 'evac-order'); // Change 'eventType=Order' to 'type=evac-order'
        break;
      case 'Alert':
        queryParams.set('type', 'evac-alert'); // Change 'eventType=Alert' to 'type=evac-alert'
        break;
      case 'area-restriction':
        queryParams.set('type', 'area-restriction'); // Change 'eventType=area-restriction' to 'type=area-restriction'
        this.renameQueryParams(queryParams, 'eventNumber', 'id');
        this.renameQueryParams(queryParams, 'eventName', 'name');
        break;
      case 'ban':
        queryParams.set('type', 'bans-prohibitions'); // Change 'eventType=ban' to 'type=bans-prohibitions'
        this.renameQueryParams(queryParams, 'eventNumber', 'id');
        break;
      case 'danger-rating':
        queryParams.set('type', 'danger-rating'); // Change 'eventType=ban' to 'type=bans-prohibitions'
        this.renameQueryParams(queryParams, 'eventNumber', 'sysid');
        this.renameQueryParams(queryParams, 'eventName', 'id');
        break;
      default:
        break;
    }
  }

    // Reverse the query parameter transformations (for desktop)
    private reverseTransformQueryParams(queryParams: URLSearchParams): void {
      const type = queryParams.get('type');
      
      switch (type) {
        case 'evac-order':
          queryParams.set('eventType', 'Order'); // Reverse 'type=evac-order' to 'eventType=Order'
          break;
        case 'evac-alert':
          queryParams.set('eventType', 'Alert'); // Reverse 'type=evac-alert' to 'eventType=Alert'
          break;
        case 'area-restriction':
          queryParams.set('eventType', 'area-restriction'); // Reverse 'type=area-restriction' to 'eventType=area-restriction'
          this.renameQueryParams(queryParams, 'id', 'eventNumber');
          this.renameQueryParams(queryParams, 'name', 'eventName');
          break;
        case 'bans-prohibitions':
          queryParams.set('eventType', 'ban'); // Reverse 'type=bans-prohibitions' to 'eventType=ban'
          this.renameQueryParams(queryParams, 'id', 'eventNumber');
          break;
        case 'danger-rating':
          queryParams.set('eventType', 'danger-rating'); // Reverse 'type=danger-rating' to 'eventType=danger-rating'
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
