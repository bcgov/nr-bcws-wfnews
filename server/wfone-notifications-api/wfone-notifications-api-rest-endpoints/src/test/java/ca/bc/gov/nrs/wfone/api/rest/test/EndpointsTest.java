package ca.bc.gov.nrs.wfone.api.rest.test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
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

import ca.bc.gov.nrs.wfone.api.rest.client.v1.ValidationException;
import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.utils.ApplicationContextProvider;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.stub.TokenServiceStub;
import ca.bc.gov.test.jetty.EmbeddedServer;

public abstract class EndpointsTest {
	
	private static final Logger logger = LoggerFactory.getLogger(EndpointsTest.class);
	
	protected static boolean skipTests = false;

	protected static final int port = 8889;
	protected static final String contextPath = "/wfone-notifications-api/v1";
	protected static final String topLevelRestURL = "http://localhost:" + port + contextPath + "/";

	protected static ApplicationContext testApplicationContext;
	protected static ApplicationContext webApplicationContext;

	protected static final String clientAppCode = "wfone";
	protected static final String issuer = "http://www.webade-oauth2-stub.com/webade-oauth2";

	protected static TokenServiceStub tokenService;
	
	@BeforeClass
	public static void startServer() throws Exception {
		logger.debug("<startServer");
		
		if(skipTests) {
			logger.warn("Skipping tests");
			return;
		}
		
		testApplicationContext = new ClassPathXmlApplicationContext(new String[] { "classpath:/test-spring-config.xml" });
		
		Properties applicationProperties = testApplicationContext.getBean("applicationProperties", Properties.class);
		
		for(String key:applicationProperties.stringPropertyNames()) {
			
			String value = applicationProperties.getProperty(key);
			logger.debug(key+"="+value);
			
			System.setProperty(key, value);
		}
		
		
		Map<String, DataSource> dataSources = new HashMap<String, DataSource>();

		EmbeddedServer.startIfRequired(port, contextPath, dataSources);

		// Replace the OAUTH2 token client with the stub
		webApplicationContext = ApplicationContextProvider.getApplicationContext();
		Assert.assertNotNull(webApplicationContext);
	
			tokenService = new TokenServiceStub(clientAppCode, issuer);
	
		logger.debug(">startServer");
	}

	@AfterClass
	public static void stopServer() throws Exception {
		EmbeddedServer.stop();
		logger.debug("stopServer");
	}
	
	/**
	 * Reviews list of messages and determines if the expected set exists.
	 * @param ve
	 * @param messageKeys
	 */
	protected static void checkMessages(ValidationException ve, String... messageKeys) {
		List<Message> messages = ve.getMessages();
		
		checkMessages(messages, messageKeys);
	}

	protected static void checkMessages(List<Message> messages, String... messageKeys) {
		//create list of expected errors
		Map<String, Integer> results = new HashMap<String, Integer>();
		for (String key : messageKeys) {
			results.put(key, Integer.valueOf(0));
		}
		
		//iterate over errors and add matches=true, add unknowns=false
		for (Message message : messages) {
			String key = message.getMessage();
			
			if (! results.containsKey(key)) {
				
				results.put(key, Integer.valueOf(-1));
				
			} else if(results.get(key).intValue()>=0) {
				
				results.put(key, Integer.valueOf(results.get(key).intValue()+1));
			}
		}
		
		boolean passTest = true;
		StringBuilder sb = new StringBuilder();
		
		//iterate over list and values with false are failures or unexpected errors
		for (Entry<String, Integer> entry : results.entrySet()) {
			
			if(entry.getValue().intValue()>0) {
				
				logger.debug("checkMessages: FOUND  " + entry.getKey());
			} else if(entry.getValue().intValue()==0) {
				
				logger.debug("checkMessages: EXPECTING " + entry.getKey());
				sb.append("Expecting "+entry.getKey() + ", ");
				passTest = false;
			} else if(entry.getValue().intValue()<0) {
				
				logger.debug("checkMessages: NOT EXPECTING " + entry.getKey());
				sb.append("Not expecting "+entry.getKey() + ", ");
				passTest = false;
			}
		}
		
		Assert.assertTrue("unexpected error message OR expected message: " + sb.toString(), passTest);
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
	
	protected static String getScopeString(List<String> scopes) {
		String result = "";
			
		for(Iterator<String> iter = scopes.iterator();iter.hasNext();) {
			
			String scope = iter.next();
			
			result = result + scope;
			if(iter.hasNext()) {
				
				result = result + " ";
			}
		}
		
		return result;
	}
	
	protected static List<String> getScopes(String... scopes) {
		List<String> result = new ArrayList<>();
		
		for(int i=0;i<scopes.length;++i) {
			result.add(scopes[i]);
		}
		
		return result;
	}
	
	protected static String randomString(int length) {
		String result = "";
		
		while(result.length()<length) {
			
			result += UUID.randomUUID().toString().replace("-", "")+" ";
		}
		
		result = result.substring(0, length);
		
		return result;
	}
	
	protected static String[] randomStrings(int count, int length) {
		String[] result = new String[count];
		
		for(int i=0;i<count;++i) {
			result[i] = randomString(length);
		}
		
		return result;
	}
	
	protected static Random rnd = new Random();
	
	protected static Double randomDouble(double rangeMin, double rangeMax) {

		Double result = Double.valueOf(rangeMin + (rangeMax - rangeMin) * rnd.nextDouble());
		
		return result;
	}
	
	protected static Integer randomInteger(int rangeMin, int rangeMax) {

		Integer result = Integer.valueOf(rnd.nextInt(rangeMax-rangeMin)+rangeMin);
		
		return result;
	}
	
	protected static Long randomLong(int rangeMin, int rangeMax) {

		Long result = Long.valueOf(rnd.nextInt(rangeMax-rangeMin)+rangeMin);
		
		return result;
	}
}
