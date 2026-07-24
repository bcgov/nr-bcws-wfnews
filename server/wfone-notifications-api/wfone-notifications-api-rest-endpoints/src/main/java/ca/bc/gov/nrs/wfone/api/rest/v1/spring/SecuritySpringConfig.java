package ca.bc.gov.nrs.wfone.api.rest.v1.spring;

import static org.springframework.security.config.Customizer.withDefaults;

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
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

		http.cors(withDefaults()).csrf(csrf -> csrf.disable());
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		final CorsConfiguration configuration = new CorsConfiguration();

		configuration.setAllowedOriginPatterns(Collections.unmodifiableList(Arrays.asList("*")));
		configuration.setAllowedMethods(
				Collections.unmodifiableList(Arrays.asList("HEAD", "GET", "POST", "DELETE", "PUT", "OPTIONS")));
		configuration.setAllowedHeaders(Collections.unmodifiableList(Arrays.asList("apikey")));

		final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);

		return source;
	}
}
