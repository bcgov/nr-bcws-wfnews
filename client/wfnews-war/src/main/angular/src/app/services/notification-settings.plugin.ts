import { registerPlugin } from '@capacitor/core';

/**
 * The Android half is in NotificationSettingsPlugin.java. There is no iOS or web half,
 * so the call rejects on those platforms and the caller keeps what it had.
 */
export interface NotificationSettingsPlugin {
  areEnabled(): Promise<{ enabled: boolean }>;
}

export const NotificationSettings = registerPlugin<NotificationSettingsPlugin>(
  'NotificationSettings',
);
