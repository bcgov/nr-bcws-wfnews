import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ManagedDrawer, MobileDrawerService } from './mobile-drawer.service';

function fakeDrawer(height = 0): any {
  const drawer: any = jasmine.createSpyObj<ManagedDrawer>('drawer', [
    'visibleHeight',
    'present',
    'slideOut',
    'hideNow',
    'notifyDismissed',
  ]);
  drawer.visibleHeight.and.returnValue(height);
  return drawer;
}

describe('MobileDrawerService', () => {
  let drawers: MobileDrawerService;

  beforeEach(() => {
    drawers = new MobileDrawerService();
  });

  it('opens a Drawer after the requests of this tick', fakeAsync(() => {
    const a = fakeDrawer();
    drawers.requestOpen(a);
    expect(a.present).not.toHaveBeenCalled();

    flushMicrotasks();

    expect(a.present.calls.allArgs()).toEqual([[null]]);
  }));

  it('shows only the last Drawer asked for in one tick', fakeAsync(() => {
    const a = fakeDrawer();
    const b = fakeDrawer();
    drawers.requestOpen(a);
    drawers.requestOpen(b);
    flushMicrotasks();

    expect(a.present).not.toHaveBeenCalled();
    expect(b.present).toHaveBeenCalledTimes(1);
  }));

  it('takes the place of the open Drawer at its height, and tells its owner', fakeAsync(() => {
    const a = fakeDrawer(420);
    const b = fakeDrawer();
    drawers.requestOpen(a);
    flushMicrotasks();

    drawers.requestOpen(b);
    flushMicrotasks();

    expect(a.hideNow).toHaveBeenCalled();
    expect(a.notifyDismissed).toHaveBeenCalled();
    expect(b.present.calls.allArgs()).toEqual([[420]]);
  }));

  for (const order of ['open first', 'close first']) {
    it(`gives one result whatever the order of the requests (${order})`, fakeAsync(() => {
      const a = fakeDrawer(300);
      const b = fakeDrawer();
      drawers.requestOpen(a);
      flushMicrotasks();

      if (order === 'open first') {
        drawers.requestOpen(b);
        drawers.requestClose(a);
      } else {
        drawers.requestClose(a);
        drawers.requestOpen(b);
      }
      flushMicrotasks();

      expect(a.hideNow).toHaveBeenCalled();
      expect(a.slideOut).not.toHaveBeenCalled();
      // The owner closed it, so there is nothing to tell.
      expect(a.notifyDismissed).not.toHaveBeenCalled();
      expect(b.present.calls.allArgs()).toEqual([[300]]);
    }));
  }

  it('slides a closed Drawer out', fakeAsync(() => {
    const a = fakeDrawer();
    drawers.requestOpen(a);
    flushMicrotasks();

    drawers.requestClose(a);
    flushMicrotasks();

    expect(a.slideOut).toHaveBeenCalledTimes(1);
    expect(a.hideNow).not.toHaveBeenCalled();
  }));

  it('turns a Drawer round where it is when it opens again while it slides out', fakeAsync(() => {
    const a = fakeDrawer(150);
    drawers.requestOpen(a);
    flushMicrotasks();
    drawers.requestClose(a);
    flushMicrotasks();

    drawers.requestOpen(a);
    flushMicrotasks();

    expect(a.hideNow).not.toHaveBeenCalled();
    expect(a.present.calls.allArgs()).toEqual([[null], [150]]);
  }));

  it('replaces a Drawer that slides out, without telling its owner', fakeAsync(() => {
    const a = fakeDrawer(150);
    const b = fakeDrawer();
    drawers.requestOpen(a);
    flushMicrotasks();
    drawers.requestClose(a);
    flushMicrotasks();

    drawers.requestOpen(b);
    flushMicrotasks();

    expect(a.hideNow).toHaveBeenCalled();
    expect(a.notifyDismissed).not.toHaveBeenCalled();
    expect(b.present.calls.allArgs()).toEqual([[150]]);
  }));

  it('opens a new Drawer at the height of one destroyed in the same tick', fakeAsync(() => {
    const a = fakeDrawer(500);
    const b = fakeDrawer();
    drawers.requestOpen(a);
    flushMicrotasks();

    drawers.destroyed(a);
    drawers.requestOpen(b);
    flushMicrotasks();

    expect(b.present.calls.allArgs()).toEqual([[500]]);
  }));

  it('does not open a Drawer destroyed before its turn came', fakeAsync(() => {
    const a = fakeDrawer();
    drawers.requestOpen(a);
    drawers.destroyed(a);
    flushMicrotasks();

    expect(a.present).not.toHaveBeenCalled();
  }));
});
