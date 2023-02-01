package ca.bc.gov.nrs.wfnews.api.rest.v1.spring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableWebMvc
@Import({
  PropertiesSpringConfig.class,
  SecuritySpringConfig.class
})
public class AppConfig implements WebMvcConfigurer {
  private static final Logger LOGGER = LoggerFactory.getLogger(AppConfig.class);

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
    .allowCredentials(true)
    .allowedOriginPatterns("*")
    .allowedHeaders("*")
    .allowedMethods("HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS");

    LOGGER.info(" ### Creating CORS Mappings ### ");
  }
}