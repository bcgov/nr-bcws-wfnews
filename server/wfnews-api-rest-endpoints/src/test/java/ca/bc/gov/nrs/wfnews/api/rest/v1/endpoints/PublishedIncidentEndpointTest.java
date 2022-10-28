//package ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints;
//
//import ca.bc.gov.nrs.common.service.ConflictException;
//import ca.bc.gov.nrs.common.service.NotFoundException;
//import ca.bc.gov.nrs.common.service.ValidationFailureException;
//import ca.bc.gov.nrs.wfnews.api.rest.test.EndpointsTest;
//import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
//import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.PublishedIncidentResource;
//import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
//import ca.bc.gov.nrs.wfnews.service.api.v1.impl.IncidentsServiceImpl;
//import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
//import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.resource.AccessToken;
//import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.stub.UserInfo;
//
//import java.util.Arrays;
//
//import org.aspectj.lang.annotation.After;
//import org.easymock.EasyMock;
//import org.easymock.IMocksControl;
//import org.junit.Assert;
//import org.junit.Before;
//import org.junit.Ignore;
//import org.junit.Test;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.security.oauth2.client.OAuth2ClientContext;
//import org.springframework.security.oauth2.client.OAuth2RestTemplate;
//import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeResourceDetails;
//import org.springframework.security.oauth2.common.DefaultOAuth2AccessToken;
//
//public class PublishedIncidentEndpointTest extends EndpointsTest {
//	private static final Logger logger = LoggerFactory.getLogger(PublishedIncidentEndpointTest.class);
//	
//	protected static final String scope = getScopeString(
//			Scopes.GET_TOPLEVEL, 
//			Scopes.GET_WILDFIRE_INCIDENT,
//			Scopes.CREATE_WILDFIRE_INCIDENT,
//			Scopes.UPDATE_WILDFIRE_INCIDENT,
//			Scopes.DELETE_WILDFIRE_INCIDENT);
//	
//	protected IncidentsService service;
//	
//	public static final String USER_GUID = "84E3BE56CCB6425187D8EBCB1C8BF03D";
//	
//	private String userId;
//	
//	private String clientId;
//	
//	private String password;
//	
//	@Before
//	public void setUp() throws Exception {
//		
//		if(skipTests) {
//			logger.warn("Skipping tests");
//			return;
//		}
//		DefaultOAuth2AccessToken accessToken;
//		{
//			UserInfo userInfo = tokenService.selectUser("GOV", USER_GUID, null, null);
//			String userAccountName = userInfo.getAccountName();
//			String userSourceDirectory = userInfo.getSourceDirectory();
//			userId = userSourceDirectory + "\\" + userAccountName;
//			
//			clientId = "WFONE_NOTIFICATION_REST_SERVICE";
//			password = "password";
//			
//			AccessToken token = tokenService.getToken(clientId, password, scope, "authorization_code", redirectUri);
//			
//			AuthorizationCodeResourceDetails resource = new AuthorizationCodeResourceDetails();
//			resource.setClientId(clientId);
//			resource.setScope(Arrays.asList(scope.split(" ")));
//	
//			OAuth2RestTemplate restTemplate = new OAuth2RestTemplate(resource);
//			OAuth2ClientContext context = restTemplate.getOAuth2ClientContext();
//			accessToken = new DefaultOAuth2AccessToken(token.getAccessToken());
//			context.setAccessToken(accessToken);
//	
//			this.service = new IncidentsServiceImpl();
//			((IncidentsServiceImpl) service).setRestTemplate(restTemplate);
//			((IncidentsServiceImpl) service).setTopLevelRestURL(topLevelRestURL);
//		}
//		
//
//	}
//	
//	@After(value = "")
//	public void teardown() {
//		this.service = null;
//	}
//	
//	private FactoryContext getFactoryContext() {
//		IMocksControl control = EasyMock.createControl();
//		FactoryContext factoryContext = control.createMock(FactoryContext.class);
//		Assert.assertNotNull(factoryContext);
//		return factoryContext;
//	}
//	
//	@Test
//	public void testCreatePublishedIncident() throws ValidationFailureException, ConflictException, NotFoundException, Exception {
//		logger.debug("<testWildfireIncident");
//		
//		if(skipTests) {
//			logger.warn("Skipping tests");
//			return;
//		}
//		
//		PublishedIncidentResource publishedIncidentResource = null;
//		try {
//			publishedIncidentResource = new PublishedIncidentResource();
//			publishedIncidentResource = this.service.createPublishedWildfireIncident(publishedIncidentResource, getFactoryContext());;
//		}catch(Exception e) {
//			
//		}
//		
////		PublishedIncidentResource publishedIncidentResource = this.service.createPublishedWildfireIncident(null, null);
//	}
//	
//}