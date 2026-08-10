package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.spring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity(debug = false)
public class SecuritySpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(SecuritySpringConfig.class);

	public SecuritySpringConfig() {
		logger.info("<SecuritySpringConfig");

		logger.info(">SecuritySpringConfig");
	}

	@Bean
	WebSecurityCustomizer webSecurityCustomizer() throws Exception {

		return (web) -> {

			web
					.ignoring()
					.requestMatchers(new AntPathRequestMatcher("/openapi.*", HttpMethod.OPTIONS.name()))
					.requestMatchers(new AntPathRequestMatcher("/openapi.*",
							HttpMethod.GET.name()))
					.requestMatchers(new AntPathRequestMatcher("/checkHealth",
							HttpMethod.OPTIONS.name()))
					.requestMatchers(new AntPathRequestMatcher("/checkHealth",
							HttpMethod.GET.name()));
		};
	}

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http
				.csrf(csrf -> csrf.disable());
		return http.build();
	}
}
