package ca.bc.gov.nrs.wfim.web.controller;

import ca.bc.gov.webade.oauth2.rest.v1.token.client.Oauth2ClientException;
import ca.bc.gov.webade.oauth2.rest.v1.token.client.resource.AccessToken;
import ca.bc.gov.webade.oauth2.rest.v1.token.client.stub.UserInfo;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeResourceDetails;
import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;

public class WebadeUserPrefsTest extends EndpointsTest {
	
	private static final Logger logger = LoggerFactory.getLogger(WebadeUserPrefsTest.class);

	protected static final String scope = getScopeString(
			"GET_TOPLEVEL");

	public static final String USER_GUID = "84E3BE56CCB6425187D8EBCB1C8BF03D";
	
	public static UserInfo userInfo;
	
	public static OAuth2RestTemplate restTemplate;
	
	@BeforeClass
	public static void setup() throws Oauth2ClientException {
		{
			userInfo = tokenService.selectUser("GOV", USER_GUID, null, null);
			
			AccessToken token = tokenService.getToken(scope, "authorization_code", "lkjhiauy", redirectUri);
			
			AuthorizationCodeResourceDetails resource = new AuthorizationCodeResourceDetails();
			resource.setClientId(clientId);
			resource.setScope(Arrays.asList(scope.split(" ")));
	
			restTemplate = new OAuth2RestTemplate(resource);
			OAuth2ClientContext context = restTemplate.getOAuth2ClientContext();
			context.setAccessToken(new DefaultOAuth2AccessToken(token.getAccessToken()));
		}
	}

	@AfterClass
	public static void teardown() {

		// do nothing
	}

	//@Test
	public void testToken() throws IOException {
		logger.debug("<testToken " + topLevelURL);

		URL url = new URL(topLevelURL+"webade/userPrefs.jsp");

		{
			HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
	
			urlConnection.setRequestMethod("GET");
	
			int responseCode = urlConnection.getResponseCode();
			logger.debug("responseCode=" + responseCode);
			Assert.assertEquals(401, responseCode);
		}

		{
			HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
	
			OAuth2AccessToken accessToken = restTemplate.getAccessToken();
			logger.debug("accessToken=" + accessToken);
			String token = accessToken.getValue();
			logger.debug("token=" + token);
			
			urlConnection.setRequestMethod("GET");
			urlConnection.setRequestProperty("Authorization", "BEARER "+token);
	
			int responseCode = urlConnection.getResponseCode();
			logger.debug("responseCode=" + responseCode);
			Assert.assertEquals(200, responseCode);
			
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			try(InputStream is = urlConnection.getInputStream()) {
				
				byte[] buffer = new byte[1024];
				int read = -1;
				while((read = is.read(buffer))!=-1) {
					baos.write(buffer, 0, read);
				}
			}
			
			byte[] bytes = baos.toByteArray();
			
			String body = new String(bytes, "UTF-8");
			logger.debug("body=" + body);
		}
		
		
		logger.debug(">testToken");
	}
}
