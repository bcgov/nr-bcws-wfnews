import { fakeAsync, tick } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { ConnectivityService, PING_TIMEOUT_MS } from './connectivity.service';

function makeService(getImpl: () => any): ConnectivityService {
  const http = { get: jasmine.createSpy('get').and.callFake(getImpl) };
  const appConfig = {
    getConfig: () => ({ rest: { wfnews: 'https://example.invalid/wfnews-api' } }),
  };
  return new ConnectivityService(http as any, appConfig as any);
}

describe('ConnectivityService', () => {
  it('answers true when the ping succeeds', async () => {
    const service = makeService(() => of({ ok: true }));

    expect(await service.checkOnlineStatus()).toBe(true);
  });

  it('answers false when the ping fails', async () => {
    const service = makeService(() => throwError(new Error('offline')));

    expect(await service.checkOnlineStatus()).toBe(false);
  });

  it('answers false when a weak-network ping stalls past the timeout', fakeAsync(() => {
    const service = makeService(() => NEVER);
    let online: boolean | undefined;

    service.checkOnlineStatus().then((result) => {
      online = result;
    });

    tick(PING_TIMEOUT_MS - 1);
    expect(online).toBeUndefined();

    tick(1);
    expect(online).toBe(false);
  }));
});
