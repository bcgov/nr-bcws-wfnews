import { WebPlugin } from '@capacitor/core';
import { FCMPlugin } from './definitions';
export declare class FCMWeb extends WebPlugin implements FCMPlugin {
    constructor();
    subscribeTo(_options: {
        topic: string;
    }): Promise<{
        message: string;
    }>;
    unsubscribeFrom(_options: {
        topic: string;
    }): Promise<{
        message: string;
    }>;
    getToken(): Promise<{
        token: string;
    }>;
    deleteInstance(): Promise<boolean>;
    setAutoInit(_options: {
        enabled: boolean;
    }): Promise<void>;
    isAutoInitEnabled(): Promise<{
        enabled: boolean;
    }>;
    refreshToken(): Promise<{
        token: string;
    }>;
}
declare const FCM: FCMWeb;
export { FCM };
