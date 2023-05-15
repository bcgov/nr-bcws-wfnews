import { WebPlugin } from '@capacitor/core';
import type { AppLauncherPlugin, CanOpenURLOptions, CanOpenURLResult, OpenURLOptions, OpenURLResult } from './definitions';
export declare class AppLauncherWeb extends WebPlugin implements AppLauncherPlugin {
    canOpenUrl(_options: CanOpenURLOptions): Promise<CanOpenURLResult>;
    openUrl(options: OpenURLOptions): Promise<OpenURLResult>;
}
