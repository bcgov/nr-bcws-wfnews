import { registerPlugin } from "@capacitor/core";
const FCM = registerPlugin("FCM", {
    web: () => import("./web").then((m) => new m.FCMWeb()),
});
// export * from './web'; // @todo
export * from "./definitions";
export { FCM };
//# sourceMappingURL=index.js.map