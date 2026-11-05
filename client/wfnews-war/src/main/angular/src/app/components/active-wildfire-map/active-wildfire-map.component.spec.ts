import { UntypedFormControl } from '@angular/forms';
import { ActiveWildfireMapComponent } from './active-wildfire-map.component';

const POSITION = { coords: { latitude: 48.4, longitude: -123.4 } };

function deferred<T>() {
  let resolve: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

// The constructor needs the whole map; the location logic needs only these.
function map(permission: string, position: Promise<any>) {
  const c: any = Object.create(ActiveWildfireMapComponent.prototype);
  Object.assign(c, {
    locationState: 'off',
    locating: false,
    destroying: new AbortController(),
    snowPlowHelper: () => {},
    searchByLocationControl: new UntypedFormControl(),
    cdr: { detectChanges: () => {} },
    permissionService: { check: () => Promise.resolve(permission) },
    permissionDialog: {
      ensure: jasmine.createSpy('ensure').and.returnValue(Promise.resolve(permission)),
    },
    locationService: {
      getGpsPositionIfPermitted: jasmine.createSpy('gps').and.returnValue(position),
      findPosition: jasmine.createSpy('find').and.returnValue(position),
    },
  });
  return c;
}

describe('ActiveWildfireMapComponent location FAB', () => {
  it('stays enabled and grey while the position is slow', async () => {
    const gps = deferred<any>();
    const c = map('granted', gps.promise);

    const refresh = c.refreshLocationState();
    await new Promise((r) => setTimeout(r));
    expect(c.locationState).toBe('finding');

    gps.resolve(undefined);
    await refresh;
    expect(c.locationState).toBe('finding');
  });

  it('is ready once a position comes back', async () => {
    const c = map('granted', Promise.resolve(POSITION));
    await c.refreshLocationState();
    expect(c.locationState).toBe('ready');
  });

  it('is off only when the permission is not granted', async () => {
    const c = map('denied', Promise.resolve(POSITION));
    await c.refreshLocationState();
    expect(c.locationState).toBe('off');
    expect(c.locationService.getGpsPositionIfPermitted).not.toHaveBeenCalled();
  });

  it('ignores a second tap while the first one waits', async () => {
    const gps = deferred<any>();
    const c = map('granted', gps.promise);

    const first = c.useMyCurrentLocation();
    await c.useMyCurrentLocation();
    expect(c.permissionDialog.ensure).toHaveBeenCalledTimes(1);

    gps.resolve(POSITION);
    await first;
    expect(c.locationService.findPosition).toHaveBeenCalledTimes(1);
    expect(c.locationState).toBe('ready');
    expect(c.clickedMyLocation).toBe(true);
  });

  it('stays grey with no position, and the next tap can ask again', async () => {
    const c = map('granted', Promise.resolve(undefined));

    await c.useMyCurrentLocation();
    expect(c.locationState).toBe('finding');
    expect(c.locating).toBe(false);
  });
});
