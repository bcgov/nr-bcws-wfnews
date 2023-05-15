import { WebPlugin } from '@capacitor/core';
export class AppLauncherWeb extends WebPlugin {
    async canOpenUrl(_options) {
        return { value: true };
    }
    async openUrl(options) {
        window.open(options.url, '_blank');
        return { completed: true };
    }
}
//# sourceMappingURL=web.js.map