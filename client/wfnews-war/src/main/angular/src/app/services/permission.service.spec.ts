import { PermissionDialogService } from '@app/components/common/permission-dialog/permission-dialog.service';
import { PermissionService } from './permission.service';

// A phone where Capacitor reads "denied", and the request gives `answer`.
function phone(answer: string) {
  return {
    isWebPlatform: false,
    refreshLocationPermission: jasmine.createSpy('refresh').and.returnValue(Promise.resolve('denied')),
    requestLocationPermission: jasmine.createSpy('request').and.returnValue(Promise.resolve(answer)),
    openLocationSettings: jasmine.createSpy('openLocationSettings').and.returnValue(Promise.resolve()),
  };
}

describe('PermissionService enable', () => {
  it('asks the phone first, as a denied state can be an old answer', async () => {
    const capacitor = phone('granted');
    const service = new PermissionService(capacitor as any, null);

    expect(await service.enable('location', 'denied')).toBe('granted');
    expect(capacitor.requestLocationPermission).toHaveBeenCalled();
    expect(capacitor.openLocationSettings).not.toHaveBeenCalled();
  });

  it('opens the settings when the phone still says denied', async () => {
    const capacitor = phone('denied');
    const service = new PermissionService(capacitor as any, null);

    expect(await service.enable('location', 'denied')).toBe('denied');
    expect(capacitor.openLocationSettings).toHaveBeenCalledWith('denied');
  });

  it('opens the location settings at once when the phone setting is off', async () => {
    const capacitor = phone('services-off');
    const service = new PermissionService(capacitor as any, null);

    await service.enable('location', 'services-off');
    expect(capacitor.requestLocationPermission).not.toHaveBeenCalled();
    expect(capacitor.openLocationSettings).toHaveBeenCalledWith('services-off');
  });
});

describe('PermissionDialogService ensure', () => {
  it('lets the phone prompt when Capacitor reads denied, with no dialog', async () => {
    const dialog = jasmine.createSpyObj('dialog', ['open']);
    const service = new PermissionDialogService(dialog, new PermissionService(phone('granted') as any, null));

    expect(await service.ensure('location')).toBe('granted');
    expect(dialog.open).not.toHaveBeenCalled();
  });
});
