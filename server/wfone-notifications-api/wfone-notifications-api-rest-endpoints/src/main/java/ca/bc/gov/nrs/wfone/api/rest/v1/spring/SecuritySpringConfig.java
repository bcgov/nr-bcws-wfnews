package ca.bc.gov.nrs.wfone.api.rest.v1.spring;

import java.util.Arrays;
import java.util.Collections;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
		
		http.cors().and().csrf().disable();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		final CorsConfiguration configuration = new CorsConfiguration();

		configuration.setAllowedOrigins(Collections.unmodifiableList(Arrays.asList("*")));
		configuration.setAllowedMethods(
				Collections.unmodifiableList(Arrays.asList("HEAD", "GET", "POST", "DELETE", "PUT", "OPTIONS")));
		configuration.setAllowedHeaders(Collections.unmodifiableList(Arrays.asList("apikey")));

		final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);

		return source;
	}
}
