import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Carries the map between the full-details parent and the detail panel that
 * shows. The parent builds the one map; a panel hands up a config and waits for it.
 */
@Injectable({ providedIn: 'root' })
export class FullDetailsMapService {
  readonly config$ = new BehaviorSubject<any[]>(null);
  readonly smk$ = new BehaviorSubject<any>(null);

  setConfig(config: any): void {
    this.config$.next([config]);
  }

  setSmk(smk: any): void {
    this.smk$.next(smk);
  }

  /** The panels come and go on one route, so each starts from nothing. */
  reset(): void {
    this.config$.next(null);
    this.smk$.next(null);
  }
}
