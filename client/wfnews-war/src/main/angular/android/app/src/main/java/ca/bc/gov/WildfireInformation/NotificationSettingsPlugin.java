package ca.bc.gov.WildfireInformation;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Reports whether the phone will show this app's notifications.
 *
 * PushNotifications.checkPermissions() answers "granted" without a check below
 * Android 13, because POST_NOTIFICATIONS is a runtime permission only from 13. It also
 * cannot see a blocked channel on any version. This reads the setting itself.
 */
@CapacitorPlugin(name = "NotificationSettings")
public class NotificationSettingsPlugin extends Plugin {

    @PluginMethod
    public void areEnabled(PluginCall call) {
        JSObject result = new JSObject();
        result.put("enabled", NotificationManagerCompat.from(getContext()).areNotificationsEnabled());
        call.resolve(result);
    }
}
