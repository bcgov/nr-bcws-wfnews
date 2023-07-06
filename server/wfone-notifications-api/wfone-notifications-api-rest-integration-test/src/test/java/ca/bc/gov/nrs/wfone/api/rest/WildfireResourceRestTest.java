package ca.bc.gov.nrs.wfone.api.rest;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.time.LocalDate;
import java.util.List;
import java.util.Properties;
import java.util.Random;
import java.util.UUID;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import ca.bc.gov.nrs.common.wfone.rest.resource.CodeRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableListRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableRsrc;
import ca.bc.gov.nrs.wfone.common.model.Code;
import ca.bc.gov.nrs.wfone.common.rest.client.RestClientServiceException;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.resource.AccessToken;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.NotificationService;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.WildfireResourceServiceException;
import ca.bc.gov.nrs.wfone.api.rest.client.v1.impl.NotificationServiceImpl;
import ca.bc.gov.nrs.wfone.api.rest.v1.resource.EndpointsRsrc;
import ca.bc.gov.webade.oauth2.rest.test.client.AuthorizationCodeService;
import ca.bc.gov.webade.oauth2.rest.test.client.impl.AuthorizationCodeServiceImpl;

public class WildfireResourceRestTest {
	
	private static final Logger logger = LoggerFactory.getLogger(WildfireResourceRestTest.class);
	
	protected static boolean skipTests = false;
	
	private static ApplicationContext applicationContext;

	private static Properties properties;

	private static String AuthorizeUrl;
	private static String TokenUrl;
	private static String CheckTokenUrl;
	private static String TestClientId;
	private static String TestClientSecret;
	private static String TopLevelRestURL;

	private static NotificationService service;

	private static String GovernmentUserGuid;
	private static String GovernmentUserName;
	private static String GovernmentUserSecret;
	
	private static String RedirectUri = "http://www.redirecturi.com";
	
    private static final String INTERNAL = "Internal";
	
	@BeforeClass
	public static void beforeClass() throws Exception {
		logger.debug("<beforeClass");

		applicationContext = new ClassPathXmlApplicationContext(new String[] { "classpath:/test-spring-config.xml" });

		properties = (Properties) applicationContext.getBean("applicationProperties");

		CheckTokenUrl = properties.getProperty("webade-oauth2.check.token.url");
		Assert.assertNotNull("'webade-oauth2.check.token.url' is a required property", CheckTokenUrl);
		
		AuthorizeUrl = properties.getProperty("webade-oauth2.authorize.url");
		Assert.assertNotNull("'webade-oauth2.authorize.url' is a required property", AuthorizeUrl);
		TokenUrl = properties.getProperty("webade-oauth2.token.url");
		Assert.assertNotNull("'webade-oauth2.token.url' is a required property", TokenUrl);

		TestClientId = properties.getProperty("test.client.id");
		Assert.assertNotNull("'test.client.id' is a required property", TestClientId);
		TestClientSecret = properties.getProperty("test.client.secret");
		Assert.assertNotNull("'test.client.secret' is a required property", TestClientSecret);
		
		String restContext = properties.getProperty("context.wfone-resources-rest");
		Assert.assertNotNull("'context.wfone-resources-rest' is a required property", restContext);
		TopLevelRestURL = restContext+"/";
		logger.debug("TopLevelRestURL="+TopLevelRestURL);
		
		{
			GovernmentUserGuid = properties.getProperty("government.user.guid");
			GovernmentUserName = properties.getProperty("government.user.name");
			GovernmentUserSecret = properties.getProperty("government.user.secret");
			
			String clientId = TestClientId; 
			logger.debug("clientId="+clientId);
			String clientSecret = TestClientSecret;
			logger.debug("clientSecret="+clientSecret);
			String checkTokenUrl = CheckTokenUrl;
			logger.debug("checkTokenUrl="+checkTokenUrl);
			String tokenUrl = TokenUrl;
			logger.debug("tokenUrl="+tokenUrl);
			String userAuthorizationUri = AuthorizeUrl;
			logger.debug("userAuthorizationUri="+userAuthorizationUri);
			String scope = "WFONE.*";
	
			AuthorizationCodeService authorizationCodeService = new AuthorizationCodeServiceImpl(clientId, userAuthorizationUri);
			
			AccessToken token;
			{
				String redirectUri = RedirectUri; 
				Long organizationId = null; 
				String siteMinderUserType = INTERNAL;
				String siteMinderUserIdentifier = GovernmentUserGuid; 
				String siteMinderAuthoritativePartyIdentifier = null;
				String username = GovernmentUserName; 
				String secret = GovernmentUserSecret;
				
				token = authorizationCodeService.getImplicitToken(
						scope, 
						redirectUri, 
						organizationId, 
						siteMinderUserType, 
						siteMinderUserIdentifier, 
						siteMinderAuthoritativePartyIdentifier, 
						username, 
						secret);
			}
			
			service = new NotificationServiceImpl("Bearer "+token.getAccessToken());
			((NotificationServiceImpl) service).setTopLevelRestURL(TopLevelRestURL);
		}
		
		logger.debug(">beforeClass");
	}
	
	@Test
	public void testSwagger() throws RestClientServiceException, WildfireResourceServiceException {
		logger.debug("<testSwagger");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}
		
		EndpointsRsrc topLevelEndpoints = service.getTopLevelEndpoints();
		Assert.assertNotNull(topLevelEndpoints);
		
		String swaggerString = service.getSwaggerString();

		logger.debug(swaggerString);
		Assert.assertNotNull(swaggerString);
		
		logger.debug("<testSwagger");
	}

	@Test
	public void testOptions() throws IOException {
		logger.debug("<testOptions "+TopLevelRestURL);
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}
		
		URL url = new URL(TopLevelRestURL);
		
		HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
		
		urlConnection.setRequestMethod("OPTIONS");
		urlConnection.setRequestProperty("Access-Control-Request-Method", "GET");
		urlConnection.setRequestProperty("Access-Control-Request-Headers", "authorization");
		
		int responseCode = urlConnection.getResponseCode();
		logger.debug("responseCode="+responseCode);
		Assert.assertEquals(200, responseCode);
		
		logger.debug(">testOptions");
	}
	
	@Test
	public void testCodeTables() throws WildfireResourceServiceException {
		logger.debug("<testCodeTables");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}
		
		EndpointsRsrc topLevelEndpoints = service.getTopLevelEndpoints();
		
		String codeTableName = null;
		LocalDate effectiveAsOfDate = LocalDate.now();
		CodeTableListRsrc codeTables = service.getCodeTables(topLevelEndpoints, codeTableName, effectiveAsOfDate);
		Assert.assertNotNull(codeTables);
		List<CodeTableRsrc> codeTableList = codeTables.getCodeTableList();
		Assert.assertNotNull(codeTableList);
		
		for(CodeTableRsrc codeTable:codeTableList) {
			
			codeTable = service.getCodeTable(codeTable, effectiveAsOfDate);
			Assert.assertNotNull(codeTable);
			
			List<CodeRsrc> codes = codeTable.getCodes();
			Assert.assertNotNull(codes);
			
			for(Code code:codes) {
				Assert.assertNotNull(code.getCode());
				Assert.assertNotNull(code.getDescription());
			}
		}

		logger.debug(">testCodeTables");
	}
	
	
	static Long randomLong(int rangeMin, int rangeMax) {

		Long result = Long.valueOf(rnd.nextInt(rangeMax-rangeMin)+rangeMin);
		
		return result;
	}
	
	/**
	 * 
	 * @param length
	 * @return
	 */
	public static String getRandomString(int length) {
		String characters = "abcdefghijklomnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890 ";
		
		StringBuilder sb = new StringBuilder();
		
		if (length > 0) {
			for (int i=0; i < length; i++) {
				sb.append(characters.charAt((int) (Math.random() * characters.length())));
			}
		}
		
		return sb.toString();
	}
	
	static String randomString(int length) {
		String result = "";
		
		while(result.length()<length) {
			
			result += UUID.randomUUID().toString().replace("-", "")+" ";
		}
		
		result = result.substring(0, length);
		
		return result;
	}
	
	static Double randomDouble(double rangeMin, double rangeMax) {

		Double result = Double.valueOf(rangeMin + (rangeMax - rangeMin) * rnd.nextDouble());
		
		return result;
	}
	
	static Random rnd = new Random();
	
	static Integer randomInteger(int rangeMin, int rangeMax) {

		Integer result = Integer.valueOf(rnd.nextInt(rangeMax-rangeMin)+rangeMin);
		
		return result;
	}
	
	@AfterClass
	public static void teardown() {
		service = null;
	}

	
	static {
		disableSSLHostnameChecking();
		disableSSLCertificateChecking();
	}

	private static void disableSSLHostnameChecking() {

		HttpsURLConnection.setDefaultHostnameVerifier(new HostnameVerifier(){

			@Override
			public boolean verify(String arg0, SSLSession arg1) {
				return true;
			}});

	}
	
	/**
     * Disables the SSL certificate checking for new instances of {@link HttpsURLConnection} This has been created to
     * aid testing on a local box, not for use on production.
     */
    private static void disableSSLCertificateChecking() {
        TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
        	
        	X509Certificate[] acceptedIssuers = null;
        	
            @Override
			public X509Certificate[] getAcceptedIssuers() {
            

                return acceptedIssuers;
            }

            @Override
            public void checkClientTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
                // Not implemented
            }

            @Override
            public void checkServerTrusted(X509Certificate[] arg0, String arg1) throws CertificateException {
            	acceptedIssuers = arg0;
            }
        } };

        try {
            SSLContext sc = SSLContext.getInstance("TLS");

            sc.init(null, trustAllCerts, new java.security.SecureRandom());

            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        } catch (KeyManagementException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }
}
