import { registerPlugin } from '@capacitor/core';
const Geolocation = registerPlugin('Geolocation', {
    web: () => import('./web').then(m => new m.GeolocationWeb()),
});
export * from './definitions';
export { Geolocation };
//# sourceMappingURL=index.js.map