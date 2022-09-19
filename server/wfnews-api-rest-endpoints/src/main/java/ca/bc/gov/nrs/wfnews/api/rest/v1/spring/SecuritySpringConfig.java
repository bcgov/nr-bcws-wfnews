package ca.bc.gov.nrs.wfnews.api.rest.v1.spring;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationManagerResolver;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;

import ca.bc.gov.nrs.wfone.common.webade.oauth2.authentication.WebadeOauth2AuthenticationProvider;
import ca.bc.gov.nrs.wfone.common.webade.oauth2.token.client.TokenService;

@Configuration
@EnableWebSecurity(debug = false)
@Import({
	TokenServiceSpringConfig.class
})
public class SecuritySpringConfig extends WebSecurityConfigurerAdapter  {

	private static final Logger logger = LoggerFactory.getLogger(SecuritySpringConfig.class);
	
	private static final String DefaultScopes = "WFIM.*";

	// Beans provided by TokenServiceSpringConfig
	// This allows Spring to use the proxied service
	@Autowired 
	@Qualifier("tokenService")
	TokenService tokenService;
	
	public SecuritySpringConfig() {
		super(true);
		logger.info("<SecuritySpringConfig");
		
		logger.info(">SecuritySpringConfig");
	}
	
    @Bean
    public AuthenticationProvider authenticationProvider() {
    	WebadeOauth2AuthenticationProvider result;
    	
    	result = new WebadeOauth2AuthenticationProvider(tokenService, DefaultScopes);
    	
    	return result;
    }

	@Bean
	AuthenticationEntryPoint authenticationEntryPoint() {
		BasicAuthenticationEntryPoint result;
		
		result = new BasicAuthenticationEntryPoint();
		result.setRealmName("wfnews-api");
		
		return result;
	}

	@Override
	public void configure(WebSecurity web) throws Exception {
		
		web
		.ignoring()
		.antMatchers(HttpMethod.OPTIONS, "/openapi.*")
		.antMatchers(HttpMethod.GET, "/openapi.*")
		.antMatchers(HttpMethod.OPTIONS, "/checkHealth")
		.antMatchers(HttpMethod.GET, "/checkHealth")
		.antMatchers(HttpMethod.GET, "/incidents/**")
		.antMatchers(HttpMethod.GET, "/publicPublishedIncident/**")
		.antMatchers(HttpMethod.GET, "/publicExternalUri/**")
		.antMatchers(HttpMethod.GET, "/")
		;
	}
	
	@Bean
	public AuthenticationManagerResolver<HttpServletRequest> authenticationManagerResolver() {
		AuthenticationManagerResolver<HttpServletRequest> result;
		
		result = new AuthenticationManagerResolver<HttpServletRequest>() {

			@Override
			public AuthenticationManager resolve(HttpServletRequest httpServletRequest) {

				return new AuthenticationManager() {

					@Override
					public Authentication authenticate(Authentication authentication) throws AuthenticationException {
						
						return authenticationProvider().authenticate(authentication);
					}};
			}};
		
		return result;
	}
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		
		http
		.csrf().disable();
		
		http
		.oauth2ResourceServer(oauth2 -> oauth2
			.authenticationManagerResolver(authenticationManagerResolver())
		)
		.httpBasic().and()
		.authorizeRequests(authorize -> authorize
				.antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
				.antMatchers("/**").hasAuthority("WFIM.GET_TOPLEVEL")
				.anyRequest().denyAll()
			)
		.exceptionHandling()
		.authenticationEntryPoint(authenticationEntryPoint());
	}
}