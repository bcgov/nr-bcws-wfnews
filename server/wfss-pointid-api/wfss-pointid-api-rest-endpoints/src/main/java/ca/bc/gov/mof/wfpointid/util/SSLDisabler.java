package ca.bc.gov.mof.wfpointid.util;

import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Properties;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

/**
 * 
 * Various methods of disable SSL verification 
 * to allow untrusted keycerts.
 * 
 * See https://stackoverflow.com/questions/4663147/is-there-a-java-setting-for-disabling-certificate-validation
 * 
 * @author mbdavis
 *
 */
public class SSLDisabler {
	
	/**
	 * Disable SSL Verification and accept untrusted certificates 
	 * by overriding the HttpsURLConnection Hostname verifier.
	 * 
	 * See http://www.rgagnon.com/javadetails/java-fix-certificate-problem-in-HTTPS.html
	 */
	public static void disableSSLViaTrustManager() {
		/*
		 * fix for Exception in thread "main"
		 * javax.net.ssl.SSLHandshakeException:
		 * sun.security.validator.ValidatorException: PKIX path building failed:
		 * sun.security.provider.certpath.SunCertPathBuilderException: unable to
		 * find valid certification path to requested target
		 */
		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
				return null;
			}

			public void checkClientTrusted(X509Certificate[] certs,	String authType) throws CertificateException {
				// do nothing
			}

			public void checkServerTrusted(X509Certificate[] certs, 	String authType) throws CertificateException {
				// do nothing
			}

		} };

		try {
			SSLContext sc = SSLContext.getInstance("TLSv1.2");
			sc.init(null, trustAllCerts, new java.security.SecureRandom());
			HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

			// Create all-trusting host name verifier
			HostnameVerifier allHostsValid = new HostnameVerifier() {
				public boolean verify(String hostname, SSLSession session) {
					return true;
				}
			};
			// Install the all-trusting host verifier
			HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
		} catch (NoSuchAlgorithmException | KeyManagementException ex) {
			throw new RuntimeException("Error disabling SSL handling", ex);
		}
	}
	
	/**
	 * Disable SSL verification to allow contacting GeoServers which may not have 
	 * accepted keycerts.
	 * 
	 * NOTE: may not work
	 */
	public static void disableSSLViaSystemProperty() {
		Properties props = System.getProperties();
		props.setProperty("com.sun.net.ssl.checkRevocation", "false");
	}
}
