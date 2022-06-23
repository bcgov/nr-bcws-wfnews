package ca.bc.gov.nrs.wfim.web.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import javax.sql.DataSource;

import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.target.HotSwappableTargetSource;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import ca.bc.gov.nrs.wfim.util.ApplicationContextProvider;
import ca.bc.gov.test.jetty.EmbeddedServer;
import ca.bc.gov.webade.oauth2.rest.v1.token.client.stub.TokenServiceStub;

public abstract class EndpointsTest {
	private static final Logger logger = LoggerFactory.getLogger(EndpointsTest.class);

	protected static final int port = 8889;
	protected static final String contextPath = "/pub/wfim";
	protected static final String topLevelURL = "http://localhost:" + port + contextPath + "/";

	protected static ApplicationContext applicationContext;

	protected static final String redirectUri = "http://www.redirect.com";
	protected static final String clientId = "WFIM_REST_TEST_CLIENT";
	protected static final String clientAppCode = "WFIM";
	protected static final String issuer = "http://www.webade-oauth2-stub.com/webade-oauth2";

	protected static TokenServiceStub tokenService;
	
	@BeforeClass
	public static void startServer() throws Exception {
		logger.debug("<startServer");

		System.setProperty("webade-bootstrap-override-directory-location", "src/test/resources");
		System.setProperty("user-info-file-location", "src/test/resources/webade-xml-user-info.xml");
		
		applicationContext = new ClassPathXmlApplicationContext(new String[] { "classpath:/test-spring-config.xml" });
		
		
		Map<String, DataSource> dataSources = new HashMap<String, DataSource>();
		{
			DataSource dataSource = applicationContext.getBean("bootstrapDataSource", DataSource.class);
			dataSources.put("jdbc/webade_bootstrap", dataSource);
		}

		EmbeddedServer.startIfRequired(port, contextPath, dataSources);

		// Replace the OAUTH2 token client with the stub
		ApplicationContext webApplicationContext = ApplicationContextProvider.getApplicationContext();
		Assert.assertNotNull(webApplicationContext);
		
		{
			HotSwappableTargetSource client = webApplicationContext.getBean("swappableTokenClient", HotSwappableTargetSource.class);
			Assert.assertNotNull(client);
	
			tokenService = new TokenServiceStub(clientId, clientAppCode, issuer);
	
			client.swap(tokenService);
		}

		logger.debug(">startServer");
	}

	@AfterClass
	public static void stopServer() throws Exception {
		EmbeddedServer.stop();
		logger.debug("stopServer");
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
	
	protected static String getScopeString(String... scopes) {
		String result = "";
		
		for(int i=0;i<scopes.length;++i) {
			result = result + scopes[i];
			if(i<scopes.length-1) {
				result = result + " ";
			}
		}
		
		return result;
	}
	
	static String randomString(int length) {
		String result = "";
		
		while(result.length()<length) {
			
			result += UUID.randomUUID().toString().replace("-", "")+" ";
		}
		
		result = result.substring(0, length);
		
		return result;
	}
	
	static Random rnd = new Random();
	
	static Double randomDouble(double rangeMin, double rangeMax) {

		Double result = Double.valueOf(rangeMin + (rangeMax - rangeMin) * rnd.nextDouble());
		
		return result;
	}
	
	static Integer randomInteger(int rangeMin, int rangeMax) {

		Integer result = Integer.valueOf(rnd.nextInt(rangeMax-rangeMin)+rangeMin);
		
		return result;
	}
}
