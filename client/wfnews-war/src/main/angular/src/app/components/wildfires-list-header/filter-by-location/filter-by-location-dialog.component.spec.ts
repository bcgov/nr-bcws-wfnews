import {
  FilterByLocationDialogComponent,
  LocationData,
} from './filter-by-location-dialog.component';

const POSITION = { coords: { latitude: 48.4, longitude: -123.4 } };

function deferred<T>() {
  let resolve: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

function dialog(permission: string, position: Promise<any>) {
  const c: any = Object.create(FilterByLocationDialogComponent.prototype);
  Object.assign(c, {
    locationData: new LocationData(),
    permissionDialog: { ensure: () => Promise.resolve(permission) },
    locationService: { findPosition: () => position },
  });
  return c;
}

describe('FilterByLocationDialogComponent use your location', () => {
  it('stays on while it waits, then uses the position', async () => {
    const gps = deferred<any>();
    const c = dialog('granted', gps.promise);

    const choice = c.useUserLocation();
    expect(c.locationData.useUserLocation).toBe(true);

    gps.resolve(POSITION);
    await choice;
    expect(c.locationData.useUserLocation).toBe(true);
    expect(c.locationData.latitude).toBe(48.4);
  });

  it('turns off when no position comes', async () => {
    const c = dialog('granted', Promise.resolve(undefined));
    await c.useUserLocation();
    expect(c.locationData.useUserLocation).toBe(false);
  });

  it('turns off when the permission is not granted', async () => {
    const c = dialog('denied', Promise.resolve(POSITION));
    await c.useUserLocation();
    expect(c.locationData.useUserLocation).toBe(false);
    expect(c.locationData.latitude).toBeUndefined();
  });

  it('ignores a late position after the user turns it off', async () => {
    const gps = deferred<any>();
    const c = dialog('granted', gps.promise);

    const choice = c.useUserLocation();
    await new Promise((r) => setTimeout(r));
    await c.useUserLocation();
    gps.resolve(POSITION);
    await choice;
    expect(c.locationData.useUserLocation).toBe(false);
    expect(c.locationData.latitude).toBeUndefined();
  });

  it('ignores a late position after the clear button', async () => {
    const gps = deferred<any>();
    const c = dialog('granted', gps.promise);

    const choice = c.useUserLocation();
    c.locationData.useUserLocation = false;
    gps.resolve(POSITION);
    await choice;
    expect(c.locationData.latitude).toBeUndefined();
  });
});
