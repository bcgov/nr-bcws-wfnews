import { registerPlugin } from '@capacitor/core';
const AppLauncher = registerPlugin('AppLauncher', {
    web: () => import('./web').then(m => new m.AppLauncherWeb()),
});
export * from './definitions';
export { AppLauncher };
//# sourceMappingURL=index.js.map