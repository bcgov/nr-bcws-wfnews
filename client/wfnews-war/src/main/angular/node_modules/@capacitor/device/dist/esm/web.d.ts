import { WebPlugin } from '@capacitor/core';
import type { BatteryInfo, DeviceId, DeviceInfo, DevicePlugin, GetLanguageCodeResult, LanguageTag } from './definitions';
declare global {
    interface Navigator {
        getBattery: any;
        oscpu: any;
    }
    interface Window {
        InstallTrigger?: any;
        ApplePaySession?: any;
        chrome?: any;
    }
}
export declare class DeviceWeb extends WebPlugin implements DevicePlugin {
    getId(): Promise<DeviceId>;
    getInfo(): Promise<DeviceInfo>;
    getBatteryInfo(): Promise<BatteryInfo>;
    getLanguageCode(): Promise<GetLanguageCodeResult>;
    getLanguageTag(): Promise<LanguageTag>;
    parseUa(ua: string): any;
    getUid(): string;
    uuid4(): string;
}
