package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.spring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableWebSecurity(debug = false)
public class SecuritySpringConfig extends WebSecurityConfigurerAdapter  {

	private static final Logger logger = LoggerFactory.getLogger(SecuritySpringConfig.class);
	
	public SecuritySpringConfig() {
		super(true);
		logger.info("<SecuritySpringConfig");
		
		logger.info(">SecuritySpringConfig");
	}

	@Override
	public void configure(WebSecurity web) throws Exception {
		
		web
		.ignoring()
		.antMatchers(HttpMethod.OPTIONS, "/openapi.*")
		.antMatchers(HttpMethod.GET, "/openapi.*")
		.antMatchers(HttpMethod.OPTIONS, "/checkHealth")
		.antMatchers(HttpMethod.GET, "/checkHealth")
		;
	}
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		
		http
		.csrf().disable();
	}
}
