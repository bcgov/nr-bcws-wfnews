package ca.bc.gov.WildfireInformation.rof;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;

/** Sends one queued report. WorkManager runs it when a network is connected, also with the app closed. */
public class RofUploadWorker extends Worker {
    static final String KEY_SUBMISSION_ID = "submissionID";
    private static final String TAG = "RofUpload";
    private static final String USER_AGENT = "bc-wildfire-android";

    public RofUploadWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        String id = getInputData().getString(KEY_SUBMISSION_ID);
        if (!RofRules.isValidSubmissionId(id)) {
            return Result.failure();
        }
        RofReportStore store = new RofReportStore(getApplicationContext());
        RofReportStore.Meta meta = store.load(id);
        if (meta == null) {
            // Cancelled, or Sync sent it first.
            return Result.success();
        }
        if (System.currentTimeMillis() >= meta.expiresAt || !RofRules.isAllowedUrl(meta.url)) {
            Log.i(TAG, id + ": dropped, expired or address not allowed");
            store.delete(id);
            return Result.failure();
        }

        int status;
        try {
            status = post(meta, store.body(id));
        } catch (IOException e) {
            Log.i(TAG, id + ": no answer, retry after attempt " + getRunAttemptCount());
            return Result.retry();
        }
        Log.i(TAG, id + ": HTTP " + status);

        if (RofRules.isSuccess(status)) {
            // Sent is recorded before the delete: a crash between the two gives a resend, which the server drops.
            try {
                store.markSent(id);
            } catch (IOException e) {
                Log.w(TAG, id + ": sent, but not recorded");
            }
            store.delete(id);
            return Result.success();
        }
        if (RofRules.isPermanentFailure(status)) {
            store.delete(id);
            return Result.failure();
        }
        return Result.retry();
    }

    private static int post(RofReportStore.Meta meta, File body) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) URI.create(meta.url).toURL().openConnection();
        try {
            connection.setInstanceFollowRedirects(false);
            connection.setConnectTimeout(30_000);
            connection.setReadTimeout(120_000);
            connection.setRequestMethod("POST");
            connection.setDoOutput(true);
            connection.setFixedLengthStreamingMode(body.length());
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + meta.boundary);
            connection.setRequestProperty("User-Agent", USER_AGENT);
            try (InputStream in = new FileInputStream(body); OutputStream out = connection.getOutputStream()) {
                byte[] buffer = new byte[64 * 1024];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
            }
            return connection.getResponseCode();
        } finally {
            connection.disconnect();
        }
    }
}
