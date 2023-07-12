package ca.bc.gov.mof.wfpointid.test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;

public class NearbyTests extends EndpointsTest {

	private static final Logger logger = LoggerFactory.getLogger(NearbyTests.class);

	protected RestTemplate restTemplate;

	@Before
	public void setup() {

		restTemplate = new RestTemplate();
	}

	@Test
	public void testNearby() throws InterruptedException {
		logger.debug("<testNearby");

		Thread.sleep(10000);
		
		String urlString = topLevelRestURL + "/nearby?lat=48.4549138&lon=-123.4427607&radius=50";
		String method = "GET";
		String body = null;
		String contentType = "application/json";
		Map<String, String> headerParams = null;

		String result = Process(urlString, method, body, contentType, headerParams);
		logger.debug("result=" + result);

		logger.debug("<testNearby");
	}

	public String Process(String urlString, String method, String body, String contentType,
			Map<String, String> headerParams) {
		logger.debug("<Process");

		long startTime = System.currentTimeMillis();

		String result = null;

		logger.debug("urlString=" + urlString);

		HttpURLConnection conn = null;
		try {

			URL url = new URL(urlString);

			String queryString = url.getQuery();
			logger.debug("query=" + queryString);

			if (queryString != null) {
				urlString = urlString.substring(0, (urlString.length() - queryString.length()) - 1);

				logger.debug("urlString=" + urlString);

				urlString = urlString + "?" + queryString;

			}

			logger.info("Rest call: " + urlString);

			conn = (HttpURLConnection) url.openConnection();
			HttpURLConnection.setFollowRedirects(false);

			conn.setRequestMethod(method);

			if (headerParams != null) {

				for (String key : headerParams.keySet()) {

					String value = headerParams.get(key);

					if (value != null) {

						if (key.contains("\n") || value.contains("\n")) {

							logger.warn("Ignoring header with invalid value: " + key);
						} else {

							logger.debug("Adding header " + key + "=" + value);
							conn.setRequestProperty(key, value);
						}
					}
				}
			}

			conn.setRequestProperty("Accept", contentType);

			conn.setDoInput(true);
			conn.setDoOutput(true);

			if ("POST".equals(method) || "PUT".equals(method)) {

				conn.setRequestProperty("Content-Type", contentType);

				StringReader sr = new StringReader(body);

				try (OutputStreamWriter os = new java.io.OutputStreamWriter(conn.getOutputStream()))

				{
					char[] c = new char[1024];
					int read = -1;
					while ((read = sr.read(c)) != -1) {
						os.write(c, 0, read);
					}
				}
			}

			int responseCode = conn.getResponseCode();
			logger.info("Rest call response: " + responseCode + ":" + conn.getResponseMessage());

			contentType = conn.getContentType();

			if (responseCode > 500) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 500) {

				try (InputStream is = conn.getErrorStream()) {

					ByteArrayOutputStream baos = new ByteArrayOutputStream();

					byte[] b = new byte[1024];
					int read = -1;
					while ((read = is.read(b)) != -1) {
						baos.write(b, 0, read);
					}

					result = baos.toString();
				}

				throw new RuntimeException(responseCode + " " + result);

			} else if (responseCode == 417) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 416) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 415) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 414) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 413) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 412) {
				throw new RuntimeException(conn.getResponseMessage());
			} else if (responseCode == 411) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 410) {
				throw new RuntimeException(conn.getResponseMessage());
			} else if (responseCode == 409) {
				throw new RuntimeException(conn.getResponseMessage());
			} else if (responseCode == 408) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 407) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 406) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 405) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 404) {
				// do nothing
			} else if (responseCode == 403) {
				throw new RuntimeException(conn.getResponseMessage());
			} else if (responseCode == 402) {
				throw new RuntimeException(responseCode + " " + conn.getResponseMessage());
			} else if (responseCode == 401) {
				throw new RuntimeException(conn.getResponseMessage());
			} else if (responseCode == 400) {

				try (InputStream is = conn.getErrorStream()) {

					ByteArrayOutputStream baos = new ByteArrayOutputStream();

					byte[] b = new byte[1024];
					int read = -1;
					while ((read = is.read(b)) != -1) {
						baos.write(b, 0, read);
					}

					String responseString = baos.toString();

					logger.debug("responseString=\n" + responseString);

					throw new RuntimeException(responseCode + " " + responseString);
				}

			} else if (responseCode == 307) {

				try (InputStream is = conn.getInputStream()) {

					ByteArrayOutputStream baos = new ByteArrayOutputStream();

					byte[] b = new byte[1024];
					int read = -1;
					while ((read = is.read(b)) != -1) {
						baos.write(b, 0, read);
					}

					String responseString = baos.toString();

					logger.debug("responseString=\n" + responseString);

					throw new RuntimeException(responseCode + " " + responseString);
				}

			} else if (responseCode == 305) {

				String location = conn.getHeaderField("Location");

				throw new RuntimeException(responseCode + " " + location);

			} else if (responseCode == 304) {

				throw new RuntimeException(responseCode + "");

			} else if (responseCode == 303) {

				try (InputStream is = conn.getInputStream()) {

					ByteArrayOutputStream baos = new ByteArrayOutputStream();

					byte[] b = new byte[1024];
					int read = -1;
					while ((read = is.read(b)) != -1) {
						baos.write(b, 0, read);
					}

					String responseString = baos.toString();

					logger.debug("responseString=\n" + responseString);

					throw new RuntimeException(responseCode + " " + responseString);
				}

			} else if (responseCode == 302) {

				try (InputStream is = conn.getInputStream()) {

					ByteArrayOutputStream baos = new ByteArrayOutputStream();

					byte[] b = new byte[1024];
					int read = -1;
					while ((read = is.read(b)) != -1) {
						baos.write(b, 0, read);
					}

					String responseString = baos.toString();

					logger.debug("responseString=\n" + responseString);

					throw new RuntimeException(responseCode + " " + responseString);
				}

			} else if (responseCode == 301) {

				try (InputStream is = conn.getInputStream()) {

					ByteArrayOutputStream baos = new ByteArrayOutputStream();

					byte[] b = new byte[1024];
					int read = -1;
					while ((read = is.read(b)) != -1) {
						baos.write(b, 0, read);
					}

					String responseString = baos.toString();

					logger.debug("responseString=\n" + responseString);

					throw new RuntimeException(responseCode + " " + responseString);
				}

			} else if (responseCode == 205) {
				// do nothing
			} else if (responseCode == 204) {
				// do nothing
			} else if (responseCode == 203 || responseCode == 202 || responseCode == 201 || responseCode == 200) {

				try (InputStream is = conn.getInputStream()) {

					ByteArrayOutputStream baos = new ByteArrayOutputStream();

					byte[] b = new byte[1024];
					int read = -1;
					while ((read = is.read(b)) != -1) {
						baos.write(b, 0, read);
					}

					result = baos.toString();
				}

			} else {
				throw new RuntimeException(
						"Unsupported HTTP Response: " + responseCode + " " + conn.getResponseMessage());
			}

		} catch (MalformedURLException e) {
			throw new RuntimeException(e);
		} catch (UnsupportedEncodingException e) {
			throw new RuntimeException(e);
		} catch (IOException e) {
			throw new RuntimeException(e);
		} finally {
			if (conn != null) {
				conn.disconnect();
			}
		}

		long duration = System.currentTimeMillis() - startTime;

		double seconds = (double) duration / (double) 1000;

		logger.info("Rest call completed: " + seconds + " seconds");

		logger.debug(">Process");
		return result;
	}

}
