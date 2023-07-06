package ca.bc.gov.mof.wfpointid.test.util;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Optional;

import org.junit.AssumptionViolatedException;

import junit.framework.AssertionFailedError;

public class HttpAssert {

	/**
	 * Do a GET to the provided URL and return an error message if it fails in a way that indicates the service is not ready to use for tests
	 * @param urlString
	 */
	public static Optional<String> requireUrlPresent(String urlString) {
		URL url;
		try {
			url = new URL(urlString);
		} catch (MalformedURLException e) {
			throw new IllegalArgumentException(e);
		}
		HttpURLConnection conn = null;
		try {
			conn = (HttpURLConnection) url.openConnection();
			int responseCode = conn.getResponseCode();
			if (responseCode == 404 || responseCode >= 500) {
				Optional.of(urlString+" response was "+responseCode);
			} 
		} catch (IOException e) {
			return Optional.of("Could not connect to "+urlString+" due to "+e.getMessage());
		} finally {
			if (conn!=null) conn.disconnect();
		}
		
		return Optional.empty();
	}

	/**
	 * Assume the service at the given URL is ready to be tested.
	 * @param urlString
	 * @param message
	 */
	public static void assumeUrlPresent(String urlString, String message) {
		requireUrlPresent(urlString).ifPresent(ex->{throw new AssumptionViolatedException(String.format("%s: %s", message, ex));});
	}

	/**
	 * Assert the service at the given URL is ready to be tested 
	 * @param urlString
	 * @param message
	 */
	static void assertUrlPresent(String urlString, String message) {
		requireUrlPresent(urlString).ifPresent(ex->{throw new AssertionFailedError(String.format("%s: %s", message, ex));});
	}

}
