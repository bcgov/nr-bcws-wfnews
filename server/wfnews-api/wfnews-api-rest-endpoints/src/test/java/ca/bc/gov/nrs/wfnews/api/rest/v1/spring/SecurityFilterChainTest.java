package ca.bc.gov.nrs.wfnews.api.rest.v1.spring;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import jakarta.servlet.Filter;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.aop.target.HotSwappableTargetSource;
import org.springframework.core.env.MapPropertySource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockServletContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;

import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.TokenService;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.resource.CheckedToken;

/**
 * Drives the real filter chain that SecuritySpringConfig builds, with the WebADE
 * token check stubbed out. Guards the POST /publishedIncident 401 regression.
 */
public class SecurityFilterChainTest {

	/** Must satisfy DefaultBearerTokenResolver's "^Bearer [a-zA-Z0-9-._~+/]+=*$". */
	private static final String TOKEN = "a-fake.access_token";

	private AnnotationConfigWebApplicationContext context;
	private Filter springSecurityFilterChain;
	private StubTokenService stubTokenService;

	@BeforeEach
	public void setUp() {
		Map<String, Object> properties = new HashMap<>();
		properties.put("WEBADE_OAUTH2_CLIENT_ID", "not-a-real-client");
		properties.put("WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET", "test-only-not-a-secret");
		properties.put("WEBADE-OAUTH2_CHECK_TOKEN_URL", "http://localhost:0/checkToken");
		properties.put("WEBADE-OAUTH2_TOKEN_URL", "http://localhost:0/token");

		this.context = new AnnotationConfigWebApplicationContext();
		this.context.setServletContext(new MockServletContext());
		this.context.getEnvironment().getPropertySources()
				.addFirst(new MapPropertySource("test", properties));
		this.context.register(SecuritySpringConfig.class);
		this.context.refresh();

		this.stubTokenService = new StubTokenService();
		this.context.getBean("swappableTokenService", HotSwappableTargetSource.class)
				.swap(this.stubTokenService.asTokenService());

		this.springSecurityFilterChain = this.context
				.getBean("springSecurityFilterChain", Filter.class);
	}

	@AfterEach
	public void tearDown() {
		SecurityContextHolder.clearContext();
		if (this.context != null) {
			this.context.close();
		}
	}

	@Test
	public void bearerTokenWithTopLevelScopeReachesTheEndpoint() throws Exception {
		this.stubTokenService.scopes = new String[] { "WFNEWS.GET_TOPLEVEL", "WFNEWS.UPDATE_INCIDENT" };

		Result result = post("/publishedIncident", "Bearer " + TOKEN);

		assertTrue(result.reachedEndOfChain, "request did not reach the endpoint; status="
				+ result.status + " error=" + result.errorMessage);
		assertEquals(200, result.status);
		assertNotNull(result.authentication);
		assertTrue(result.authentication.isAuthenticated());
		assertEquals(TOKEN, this.stubTokenService.lastCheckedToken);
	}

	@Test
	public void bearerTokenWithoutTopLevelScopeIsForbidden() throws Exception {
		this.stubTokenService.scopes = new String[] { "WFNEWS.SOME_OTHER_SCOPE" };

		Result result = post("/publishedIncident", "Bearer " + TOKEN);

		assertEquals(403, result.status);
	}

	@Test
	public void missingAuthorizationHeaderIsUnauthorized() throws Exception {
		Result result = post("/publishedIncident", null);

		assertEquals(401, result.status);
	}

	private Result post(String path, String authorizationHeader) throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
		request.setServletPath(path);
		if (authorizationHeader != null) {
			request.addHeader("Authorization", authorizationHeader);
		}
		MockHttpServletResponse response = new MockHttpServletResponse();

		Result result = new Result();
		AtomicReference<Authentication> seen = new AtomicReference<>();

		this.springSecurityFilterChain.doFilter(request, response, (req, res) -> {
			result.reachedEndOfChain = true;
			seen.set(SecurityContextHolder.getContext().getAuthentication());
		});

		result.status = response.getStatus();
		result.errorMessage = response.getErrorMessage();
		result.authentication = seen.get();
		return result;
	}

	private static final class Result {
		private boolean reachedEndOfChain;
		private int status;
		private String errorMessage;
		private Authentication authentication;
	}

	private static final class StubTokenService implements InvocationHandler {

		private String[] scopes = new String[] { "WFNEWS.GET_TOPLEVEL" };
		private String lastCheckedToken;

		/** A proxy, so the stub does not have to track the TokenService method set. */
		private TokenService asTokenService() {
			return (TokenService) Proxy.newProxyInstance(
					TokenService.class.getClassLoader(),
					new Class<?>[] { TokenService.class },
					this);
		}

		@Override
		public Object invoke(Object proxy, Method method, Object[] args) {
			switch (method.getName()) {
			case "checkToken":
				return checkToken((String) args[0]);
			case "setDefaultClientSecret":
				return null;
			case "toString":
				return "StubTokenService";
			case "hashCode":
				return System.identityHashCode(this);
			case "equals":
				return proxy == args[0];
			default:
				throw new UnsupportedOperationException(method.getName());
			}
		}

		private CheckedToken checkToken(String accessToken) {
			this.lastCheckedToken = accessToken;

			long now = System.currentTimeMillis();

			CheckedToken result = new CheckedToken();
			result.setSub("not-a-real-subject");
			result.setClientId("not-a-real-client");
			result.setClientAppCode("WFNEWS");
			result.setUserId("not-a-real-user");
			result.setUserType("IDIR");
			result.setUserGuid("00000000000000000000000000000000");
			result.setScope(this.scopes);
			result.setIat(now - 60_000L);
			result.setExp(now + 3_600_000L);

			return result;
		}
	}
}
