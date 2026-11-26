package ca.bc.gov.WildfireInformation.rof;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/** The checks and the request body for a native Report of Fire send. No Android types, so a JVM test runs it. */
final class RofRules {
    private static final Pattern SUBMISSION_ID = Pattern.compile("[A-Za-z0-9-]{1,64}");
    private static final String ALLOWED_HOST_SUFFIX = ".bcwildfireservices.com";

    private RofRules() {
    }

    // The ID becomes a file name, so it must not carry a path.
    static boolean isValidSubmissionId(String id) {
        return id != null && SUBMISSION_ID.matcher(id).matches();
    }

    // Only the notifications API: a script in the WebView must not send a report anywhere else.
    static boolean isAllowedUrl(String url) {
        if (url == null) {
            return false;
        }
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            String path = uri.getPath();
            return "https".equals(uri.getScheme())
                    && uri.getUserInfo() == null
                    && (uri.getPort() == -1 || uri.getPort() == 443)
                    && host != null
                    && host.toLowerCase(Locale.ROOT).endsWith(ALLOWED_HOST_SUFFIX)
                    && path != null
                    && path.endsWith("/rof")
                    && uri.getQuery() == null
                    && uri.getFragment() == null;
        } catch (URISyntaxException e) {
            return false;
        }
    }

    static boolean isSuccess(int status) {
        return status >= 200 && status < 300;
    }

    // A 4xx answer will not change on a retry; 408 and 429 are the exceptions.
    static boolean isPermanentFailure(int status) {
        return status >= 400 && status < 500 && status != 408 && status != 429;
    }

    /** Text parts in field order, as the WebView FormData sends them. A null value is left out. */
    static void writeMultipart(OutputStream out, String boundary, Map<String, String> fields) throws IOException {
        for (Map.Entry<String, String> field : fields.entrySet()) {
            if (field.getValue() == null) {
                continue;
            }
            write(out, "--" + boundary + "\r\n");
            write(out, "Content-Disposition: form-data; name=\"" + field.getKey() + "\"\r\n");
            write(out, "Content-Type: text/plain; charset=UTF-8\r\n\r\n");
            write(out, field.getValue());
            write(out, "\r\n");
        }
        write(out, "--" + boundary + "--\r\n");
    }

    private static void write(OutputStream out, String text) throws IOException {
        out.write(text.getBytes(StandardCharsets.UTF_8));
    }
}
