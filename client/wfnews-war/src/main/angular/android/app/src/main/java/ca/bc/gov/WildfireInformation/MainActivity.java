package ca.bc.gov.WildfireInformation;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import ca.bc.gov.WildfireInformation.rof.RofUploaderPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NotificationSettingsPlugin.class);
        registerPlugin(RofUploaderPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
