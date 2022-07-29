import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

/** A router wrapper, adding extra functions. */
@Injectable({providedIn: 'root'})
export class RouterExtService {

  private previousUrl: string = undefined;
  private currentUrl: string = undefined;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.url;
      };
    });
  }

  public getPreviousUrl(){
    return this.previousUrl;
  }
}
