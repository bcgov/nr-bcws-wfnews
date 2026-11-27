package ca.bc.gov.WildfireInformation.rof;

import android.content.Context;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * The reports that wait for a native send, one body file and one meta file each.
 * In noBackupFilesDir: private to the app and never in a backup.
 */
final class RofReportStore {
    private static final Object LOCK = new Object();
    private static final String BODY = ".body";
    private static final String META = ".json";

    static final class Meta {
        final String url;
        final String boundary;
        final long expiresAt;

        Meta(String url, String boundary, long expiresAt) {
            this.url = url;
            this.boundary = boundary;
            this.expiresAt = expiresAt;
        }
    }

    private final File dir;
    private final File sentFile;

    RofReportStore(Context context) {
        dir = new File(context.getNoBackupFilesDir(), "rof-reports");
        sentFile = new File(dir, "sent.txt");
    }

    /** Returns false when the report is already saved; a send may be reading that body now. */
    boolean saveIfAbsent(String id, String url, long expiresAt, Map<String, String> fields) throws IOException {
        synchronized (LOCK) {
            File meta = new File(dir, id + META);
            if (meta.exists()) {
                return false;
            }
            if (!dir.isDirectory() && !dir.mkdirs()) {
                throw new IOException("No report folder");
            }
            String boundary = "rof-" + UUID.randomUUID();
            File bodyTmp = new File(dir, id + BODY + ".tmp");
            try (OutputStream out = new BufferedOutputStream(new FileOutputStream(bodyTmp))) {
                RofRules.writeMultipart(out, boundary, fields);
            }
            File metaTmp = new File(dir, id + META + ".tmp");
            try {
                String json = new JSONObject()
                        .put("url", url)
                        .put("boundary", boundary)
                        .put("expiresAt", expiresAt)
                        .toString();
                Files.write(metaTmp.toPath(), json.getBytes(StandardCharsets.UTF_8));
            } catch (JSONException e) {
                throw new IOException(e);
            }
            // The meta file goes last: while it is missing, the report does not exist.
            if (!bodyTmp.renameTo(body(id)) || !metaTmp.renameTo(meta)) {
                delete(id);
                throw new IOException("Report not saved");
            }
            return true;
        }
    }

    Meta load(String id) {
        File meta = new File(dir, id + META);
        if (!meta.exists()) {
            return null;
        }
        try {
            JSONObject json = new JSONObject(new String(Files.readAllBytes(meta.toPath()), StandardCharsets.UTF_8));
            return new Meta(json.getString("url"), json.getString("boundary"), json.getLong("expiresAt"));
        } catch (IOException | JSONException e) {
            return null;
        }
    }

    File body(String id) {
        return new File(dir, id + BODY);
    }

    void delete(String id) {
        synchronized (LOCK) {
            new File(dir, id + META).delete();
            new File(dir, id + META + ".tmp").delete();
            body(id).delete();
            new File(dir, id + BODY + ".tmp").delete();
        }
    }

    List<String> pendingIds() {
        List<String> ids = new ArrayList<>();
        File[] files = dir.listFiles((folder, name) -> name.endsWith(META));
        if (files != null) {
            for (File file : files) {
                ids.add(file.getName().substring(0, file.getName().length() - META.length()));
            }
        }
        return ids;
    }

    void markSent(String id) throws IOException {
        synchronized (LOCK) {
            if (!dir.isDirectory() && !dir.mkdirs()) {
                throw new IOException("No report folder");
            }
            try (OutputStream out = new FileOutputStream(sentFile, true)) {
                out.write((id + "\n").getBytes(StandardCharsets.UTF_8));
            }
        }
    }

    List<String> takeSent() throws IOException {
        synchronized (LOCK) {
            List<String> ids = new ArrayList<>();
            if (!sentFile.exists()) {
                return ids;
            }
            for (String line : Files.readAllLines(sentFile.toPath(), StandardCharsets.UTF_8)) {
                if (RofRules.isValidSubmissionId(line) && !ids.contains(line)) {
                    ids.add(line);
                }
            }
            sentFile.delete();
            return ids;
        }
    }
}
