package ca.bc.gov.nrs.wfnews.spring;


import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.TokenService;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.impl.TokenServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.ProxyFactoryBean;
import org.springframework.aop.target.HotSwappableTargetSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableWebMvc
@ComponentScan("ca.bc.gov.nrs.wfnews.web.controller")
public class TokenServiceSpringConfig  {

	private static final Logger logger = LoggerFactory.getLogger(TokenServiceSpringConfig.class);

	public TokenServiceSpringConfig() {
		logger.info("<TokenServiceSpringConfig");

		logger.info(">TokenServiceSpringConfig");
	}

	String clientSecret = System.getenv("WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET");
	String tokenUrl = System.getenv("WEBADE-OAUTH2_TOKEN_URL");
	String checkTokenUrl = System.getenv("WEBADE-OAUTH2_CHECK_TOKEN_V2_URL");

	// Can be defined in static.properties
	// @Value("${webade-oauth2.client.id}")
	// private String webadeOauth2ClientId;

	@Bean
	public TokenService tokenServiceImpl() {
		TokenServiceImpl result;

		result = new TokenServiceImpl(
				"WFNEWS-UI",
				clientSecret,
				tokenUrl,
				checkTokenUrl);

		return result;
	}

	@Bean
	public HotSwappableTargetSource swappableTokenService() {
		HotSwappableTargetSource result;

		result = new HotSwappableTargetSource(tokenServiceImpl());

		return result;
	}

	@Bean
	public ProxyFactoryBean tokenService() {
		ProxyFactoryBean result;

		result = new ProxyFactoryBean();
		result.setTargetSource(swappableTokenService());

		return result;
	}
}
