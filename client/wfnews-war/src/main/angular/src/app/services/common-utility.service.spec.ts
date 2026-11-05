import { PERMISSION_DIALOG } from '@app/components/common/permission-banner/permission-banner.constants';
import { CommonUtilityService } from './common-utility.service';

const POSITION = { coords: { latitude: 48.4, longitude: -123.4 } };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function deferred<T>() {
  let resolve: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

// Only the snackbar matters here; the injector is read once, later, by the constructor.
function service(answer: Promise<any>) {
  const notice = { dismiss: jasmine.createSpy('dismiss') };
  const snackbar = { open: jasmine.createSpy('open').and.returnValue(notice) };
  const injector = { get: () => null };
  const s: any = new CommonUtilityService(
    snackbar as any, null, null, injector as any, null, null, null, null, null, null, null,
  );
  spyOn(s, 'ifPermitted').and.returnValue(answer);
  return { s, snackbar, notice };
}

describe('CommonUtilityService findPosition', () => {
  it('answers a page and a tap with one request', async () => {
    const gps = deferred<any>();
    const { s } = service(gps.promise);

    const page = s.getGpsPositionIfPermitted();
    const tap = s.getGpsPositionIfPermitted();
    gps.resolve(POSITION);
    expect(await page).toBe(POSITION);
    expect(await tap).toBe(POSITION);
    expect(s.ifPermitted).toHaveBeenCalledTimes(1);

    await s.getGpsPositionIfPermitted();
    expect(s.ifPermitted).toHaveBeenCalledTimes(2);
  });

  it('shows no notice when the position comes at once', async () => {
    const { s, snackbar } = service(Promise.resolve(POSITION));

    expect(await s.findPosition()).toBe(POSITION);
    await wait(350);
    expect(snackbar.open).not.toHaveBeenCalled();
  });

  it('shows a notice while it waits, and closes it when the position comes', async () => {
    const gps = deferred<any>();
    const { s, snackbar, notice } = service(gps.promise);

    const found = s.findPosition();
    await wait(350);
    expect(snackbar.open.calls.mostRecent().args[0]).toContain('Searching for location');

    gps.resolve(POSITION);
    expect(await found).toBe(POSITION);
    expect(notice.dismiss).toHaveBeenCalled();
  });

  it('says what to do when no position comes', async () => {
    const { s, snackbar } = service(Promise.resolve(undefined));

    expect(await s.findPosition()).toBeUndefined();
    expect(snackbar.open.calls.mostRecent().args[0]).toBe(
      PERMISSION_DIALOG.location.message.noPosition,
    );
  });

  it('ends quietly when the caller aborts', async () => {
    const gps = deferred<any>();
    const { s, snackbar, notice } = service(gps.promise);
    const controller = new AbortController();

    const found = s.findPosition(controller.signal);
    await wait(350);
    controller.abort();
    expect(await found).toBeUndefined();
    expect(notice.dismiss).toHaveBeenCalled();

    gps.resolve(undefined);
    await wait(0);
    expect(snackbar.open).toHaveBeenCalledTimes(1);
  });
});
