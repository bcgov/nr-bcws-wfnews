import { WebPlugin } from '@capacitor/core';
import type { NativeSettingsPlugin } from './definitions';
export declare class NativeSettingsWeb extends WebPlugin implements NativeSettingsPlugin {
    /**
     * Open iOS & Android settings.
     * Not implemented for web!
     */
    open(): Promise<{
        status: boolean;
    }>;
    /**
     * Open android settings.
     * Not implemented for web!
     */
    openAndroid(): Promise<{
        status: boolean;
    }>;
    /**
     * Open iOS settings.
     * Not implemented for web!
     */
    openIOS(): Promise<{
        status: boolean;
    }>;
}
