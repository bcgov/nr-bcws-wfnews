'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

const FCM$1 = core.registerPlugin("FCM", {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.FCMWeb()),
});

class FCMWeb extends core.WebPlugin {
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

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FCMWeb: FCMWeb,
    FCM: FCM
});

exports.FCM = FCM$1;
//# sourceMappingURL=plugin.cjs.js.map
