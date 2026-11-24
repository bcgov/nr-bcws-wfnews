import { of } from 'rxjs';
import { NotificationService } from './notification.service';

describe('NotificationService.updateUserNotificationPreferences', () => {
  let service: NotificationService;
  let putSpy: jasmine.Spy;

  beforeEach(() => {
    const appConfig = {
      getConfig: () => ({
        rest: { 'notification-api': 'https://notifications.test' },
        application: { wfnewsApiKey: 'key' },
      }),
    };
    const capacitor = {
      deviceProperties: Promise.resolve({ deviceId: 'device-1', isAndroidPlatform: true }),
      getNotificationToken: () => 'token-1',
    };
    putSpy = jasmine.createSpy('put').and.returnValue(of({}));
    service = new NotificationService(
      appConfig as any,
      { put: putSpy } as any,
      capacitor as any,
    );
  });

  // Ordinary names that the old SQL word filter stopped with no PUT and no error.
  it('sends a new Saved Location named "Drop-off cabin"', async () => {
    await service.updateUserNotificationPreferences(
      { notificationName: 'Drop-off cabin', radius: 25, latitude: 50.1, longitude: -120.3 },
      [],
    );

    expect(putSpy).toHaveBeenCalledTimes(1);
    const body = putSpy.calls.mostRecent().args[1];
    expect(body.notifications[0].notificationName).toBe('Drop-off cabin');
  });

  it('sends the list when a kept Saved Location is named "Select Lake"', async () => {
    const kept = { notificationName: 'Select Lake', radius: 10, point: { coordinates: [-121, 51] } };

    await service.updateUserNotificationPreferences(null, [kept]);

    expect(putSpy).toHaveBeenCalledTimes(1);
    expect(putSpy.calls.mostRecent().args[1].notifications).toEqual([kept]);
  });
});
