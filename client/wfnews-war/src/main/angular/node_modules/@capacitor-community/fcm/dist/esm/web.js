import { WebPlugin } from '@capacitor/core';
export class FCMWeb extends WebPlugin {
    constructor() {
        super({
            name: 'FCM',
            platforms: ['web'],
        });
    }
    subscribeTo(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    unsubscribeFrom(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    getToken() {
        throw this.unimplemented('Not implemented on web.');
    }
    deleteInstance() {
        throw this.unimplemented('Not implemented on web.');
    }
    setAutoInit(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    isAutoInitEnabled() {
        throw this.unimplemented('Not implemented on web.');
    }
    refreshToken() {
        throw this.unimplemented('Not implemented on web.');
    }
}
const FCM = new FCMWeb();
export { FCM };
//# sourceMappingURL=web.js.map