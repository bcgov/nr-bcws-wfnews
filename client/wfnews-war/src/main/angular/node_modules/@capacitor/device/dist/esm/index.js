import { registerPlugin } from '@capacitor/core';
const Device = registerPlugin('Device', {
    web: () => import('./web').then(m => new m.DeviceWeb()),
});
export * from './definitions';
export { Device };
//# sourceMappingURL=index.js.map