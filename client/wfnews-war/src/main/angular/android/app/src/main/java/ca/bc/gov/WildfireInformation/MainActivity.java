package ca.bc.gov.WildfireInformation;

import android.content.res.AssetFileDescriptor;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends BridgeActivity {

    private static final String TAG = "MainActivity";
    private static final long MAX_SLICE_BYTES = 16L * 1024L * 1024L;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NotificationSettingsPlugin.class);
        super.onCreate(savedInstanceState);

        if (bridge == null) {
            return;
        }

        bridge.setWebViewClient(new BridgeWebViewClient(bridge) {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse sliceResponse = servePmtilesSlice(request);
                if (sliceResponse != null) {
                    return sliceResponse;
                }
                return super.shouldInterceptRequest(view, request);
            }
        });

        if (bridge.getConfig().isResolveServiceWorkerRequests()) {
            ServiceWorkerController.getInstance().setServiceWorkerClient(new ServiceWorkerClient() {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
                    WebResourceResponse sliceResponse = servePmtilesSlice(request);
                    if (sliceResponse != null) {
                        return sliceResponse;
                    }
                    return bridge.getLocalServer().shouldInterceptRequest(request);
                }
            });
        }
    }

    /**
     * Serves byte slices of uncompressed `.pmtiles` APK assets via `?start=<offset>&end=<end>`
     * as `200 OK` responses, bypassing Chromium issue 40739128 (Android WebView re-applying
     * HTTP `Range` headers to `206` responses returned by `shouldInterceptRequest`).
     */
    private WebResourceResponse servePmtilesSlice(WebResourceRequest request) {
        if (request == null || bridge == null) {
            return null;
        }
        Uri url = request.getUrl();
        if (url == null || !bridge.getHost().equals(url.getHost())) {
            return null;
        }
        String path = url.getPath();
        if (path == null || !path.endsWith(".pmtiles")) {
            return null;
        }

        String startParam = url.getQueryParameter("start");
        String endParam = url.getQueryParameter("end");
        if (startParam == null || startParam.isEmpty() || endParam == null || endParam.isEmpty()) {
            return null;
        }

        String relativePath = path.replaceFirst("^/+", "");
        if (relativePath.isEmpty() || relativePath.contains("..")) {
            return null;
        }

        try {
            AssetFileDescriptor afd = getAssets().openFd("public/" + relativePath);
            FileInputStream fis;
            try {
                fis = afd.createInputStream();
            } catch (IOException e) {
                afd.close();
                throw e;
            }

            try (FileInputStream stream = fis; FileChannel channel = stream.getChannel()) {
                long totalLength = afd.getLength();
                if (totalLength <= 0) {
                    return null;
                }

                long start = Long.parseLong(startParam);
                long end = Math.min(Long.parseLong(endParam), totalLength - 1);
                long length = end - start + 1;

                if (start < 0 || start >= totalLength || start > end || length > MAX_SLICE_BYTES) {
                    Map<String, String> errHeaders = new HashMap<>();
                    errHeaders.put("Content-Range", "bytes */" + totalLength);
                    return new WebResourceResponse(
                        "application/octet-stream",
                        null,
                        416,
                        "Range Not Satisfiable",
                        errHeaders,
                        new ByteArrayInputStream(new byte[0])
                    );
                }

                byte[] data = new byte[(int) length];
                ByteBuffer buf = ByteBuffer.wrap(data);
                long pos = afd.getStartOffset() + start;
                while (buf.hasRemaining()) {
                    int n = channel.read(buf, pos);
                    if (n < 0) {
                        break;
                    }
                    pos += n;
                }

                byte[] slice = buf.hasRemaining() ? Arrays.copyOf(data, buf.position()) : data;
                Map<String, String> headers = new HashMap<>();
                headers.put("Content-Length", String.valueOf(slice.length));
                headers.put("Cache-Control", "no-cache");
                headers.put("Access-Control-Allow-Origin", "*");

                return new WebResourceResponse(
                    "application/octet-stream",
                    null,
                    200,
                    "OK",
                    headers,
                    new ByteArrayInputStream(slice)
                );
            }
        } catch (IOException | NumberFormatException e) {
            Log.w(TAG, "Failed to serve PMTiles slice: " + url, e);
            return null;
        }
    }
}
