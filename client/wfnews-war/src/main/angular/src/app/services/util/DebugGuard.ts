import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { DebugAccessService } from '../debug-access.service';
import { ResourcesRoutes } from '../../utils';

/**
 * Keeps the diagnostics screen off the route table for an ordinary user. Typing
 * the address does not open it: the taps on the More screen do.
 */
@Injectable({
  providedIn: 'root',
})
export class DebugGuard {
  constructor(
    private access: DebugAccessService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    return this.access.unlocked
      ? true
      : this.router.parseUrl(`/${ResourcesRoutes.MORE}`);
  }
}
