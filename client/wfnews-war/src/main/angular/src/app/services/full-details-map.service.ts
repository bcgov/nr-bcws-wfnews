import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Carries the map between the full-details parent and whichever detail panel is
 * showing. The parent owns the one map container; the panels used to reach into
 * it by element id, which only worked because they each built their own Leaflet
 * map. With SMK the parent builds the map, so the panel hands up a config and
 * waits for the map to come back.
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
