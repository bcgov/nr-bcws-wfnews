import { MobileSlidingDrawerComponent } from './mobile-sliding-drawer.component';

// The private Stop logic, on an instance with no template.
function drawerWith(maxHeight: number, startPart = 0.5): any {
  const drawer: any = new MobileSlidingDrawerComponent(null, null, null);
  drawer.startPart = startPart;

  const probe = document.createElement('div');
  probe.style.cssText = `position: fixed; top: 0; height: ${maxHeight}px; padding-top: 20px;`;
  document.body.appendChild(probe);
  drawer.probe = { nativeElement: probe };
  drawer.header = { nativeElement: { offsetHeight: 56 } };
  drawer.sheet = { nativeElement: document.createElement('div') };
  try {
    drawer.measure();
  } finally {
    probe.remove();
  }
  return drawer;
}

describe('MobileSlidingDrawerComponent Drawer Stops', () => {
  it('puts the Stops at parts of the height under the top Inset', () => {
    const drawer = drawerWith(800);

    expect(drawer.maxHeight).toBe(800);
    expect(drawer.stops).toEqual([200, 400, 560, 800]);
    expect(drawer.startStop).toBe(400);
  });

  it('drops a Stop too near the one under it, but keeps full height', () => {
    const drawer = drawerWith(150);

    expect(drawer.stops).toEqual([38, 150]);
  });

  describe('a release', () => {
    // Wide gaps, so the 200 ms of momentum can end nearer the Stop above.
    let drawer: any;
    beforeEach(() => {
      drawer = drawerWith(2000);
      expect(drawer.stops).toEqual([500, 1000, 1400, 2000]);
    });

    it('rests on the nearest Stop when it is slow', () => {
      expect(drawer.pickStop(1150, 0)).toBe(1000);
      expect(drawer.pickStop(1250, 0)).toBe(1400);
    });

    it('carries on for its momentum', () => {
      // 0.4 px per ms up is 80 px more, so 1180 lands nearer 1400.
      expect(drawer.pickStop(1180, -0.4)).toBe(1400);
    });

    it('moves at least one Stop down when it is a fast flick down', () => {
      expect(drawer.pickStop(1390, 0.51)).toBe(1000);
    });

    it('moves at least one Stop up when it is a fast flick up', () => {
      expect(drawer.pickStop(1010, -0.51)).toBe(1400);
    });

    it('closes the Drawer below the lowest Stop', () => {
      expect(drawer.pickStop(460, 0)).toBeNull();
      expect(drawer.pickStop(520, 0.6)).toBeNull();
    });

    it('does not close a Drawer just under the lowest Stop', () => {
      expect(drawer.pickStop(480, 0)).toBe(500);
    });
  });

  it('measures speed over the last 100 ms only', () => {
    const drawer = drawerWith(800);
    const samples = [
      { time: 0, y: 0 },
      { time: 50, y: 10 },
      { time: 150, y: 60 },
    ];

    expect(drawer.speed(samples)).toBe(0.5);
    expect(drawer.speed([{ time: 10, y: 5 }])).toBe(0);
  });
});
