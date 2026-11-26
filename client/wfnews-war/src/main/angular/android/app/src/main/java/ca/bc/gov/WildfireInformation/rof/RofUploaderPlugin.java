package ca.bc.gov.WildfireInformation.rof;

import androidx.work.BackoffPolicy;
import androidx.work.Constraints;
import androidx.work.Data;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/** The Android half of rof-uploader.plugin.ts. It takes report fields only, never a file path or a free address. */
@CapacitorPlugin(name = "RofUploader")
public class RofUploaderPlugin extends Plugin {
    private static final String WORK_PREFIX = "rof-upload-";
    private static final String[] FIELDS = {"resource", "image1", "image2", "image3"};

    @PluginMethod
    public void enqueue(PluginCall call) {
        String id = call.getString("submissionID");
        String url = call.getString("url");
        // A whole JS number arrives as Integer, Long or Double; getDouble and getLong each take only some.
        Object expiresAt = call.getData().opt("expiresAt");
        if (!RofRules.isValidSubmissionId(id) || !RofRules.isAllowedUrl(url)
                || !(expiresAt instanceof Number) || call.getString("resource") == null) {
            call.reject("Report refused");
            return;
        }
        Map<String, String> fields = new LinkedHashMap<>();
        for (String name : FIELDS) {
            fields.put(name, call.getString(name));
        }
        try {
            new RofReportStore(getContext()).saveIfAbsent(id, url, ((Number) expiresAt).longValue(), fields);
        } catch (IOException e) {
            call.reject("Report not saved", e);
            return;
        }

        OneTimeWorkRequest request = new OneTimeWorkRequest.Builder(RofUploadWorker.class)
                .setConstraints(new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                // Linear, not exponential: a weak signal on a highway fails often, and each wait must stay short.
                .setBackoffCriteria(BackoffPolicy.LINEAR, 30, TimeUnit.SECONDS)
                .setInputData(new Data.Builder().putString(RofUploadWorker.KEY_SUBMISSION_ID, id).build())
                .build();
        WorkManager.getInstance(getContext()).enqueueUniqueWork(WORK_PREFIX + id, ExistingWorkPolicy.KEEP, request);
        call.resolve();
    }

    @PluginMethod
    public void pending(PluginCall call) {
        call.resolve(ids(new RofReportStore(getContext()).pendingIds()));
    }

    @PluginMethod
    public void takeSent(PluginCall call) {
        try {
            call.resolve(ids(new RofReportStore(getContext()).takeSent()));
        } catch (IOException e) {
            call.reject("Sent list unreadable", e);
        }
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        String id = call.getString("submissionID");
        if (!RofRules.isValidSubmissionId(id)) {
            call.reject("Report refused");
            return;
        }
        WorkManager.getInstance(getContext()).cancelUniqueWork(WORK_PREFIX + id);
        new RofReportStore(getContext()).delete(id);
        call.resolve();
    }

    private static JSObject ids(List<String> ids) {
        JSObject result = new JSObject();
        result.put("submissionIDs", new JSArray(ids));
        return result;
    }
}
