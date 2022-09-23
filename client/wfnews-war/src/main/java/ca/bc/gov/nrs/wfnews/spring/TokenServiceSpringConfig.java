package ca.bc.gov.nrs.wfnews.spring;


import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.TokenService;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.impl.TokenServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.ProxyFactoryBean;
import org.springframework.aop.target.HotSwappableTargetSource;
import org.springframework.beans.factory.annotation.Value;
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

	// Can be defined in static.properties
	@Value("${webade-oauth2.client.id}")
	private String webadeOauth2ClientId;

	@Value("${webade-oauth2.wfim-incident-manager-ui.client.secret}")
	private String webadeOauth2ClientSecret;

	@Value("${webade-oauth2.check.token.v2.url}")
	private String webadeOauth2CheckTokenUrl;

	@Value("${webade-oauth2.token.url}")
	private String webadeOauth2TokenUrl;

	@Bean
	public TokenService tokenServiceImpl() {
		TokenServiceImpl result;

		result = new TokenServiceImpl(
				webadeOauth2ClientId,
				webadeOauth2ClientSecret,
				webadeOauth2CheckTokenUrl,
				webadeOauth2TokenUrl);

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
