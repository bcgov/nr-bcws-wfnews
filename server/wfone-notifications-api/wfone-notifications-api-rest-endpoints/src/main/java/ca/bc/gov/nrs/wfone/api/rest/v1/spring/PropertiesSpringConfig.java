package ca.bc.gov.nrs.wfone.api.rest.v1.spring;

import java.io.IOException;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.PropertiesFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.io.ClassPathResource;

import java.util.Map;
import java.util.Map.Entry;

@Configuration
public class PropertiesSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(PropertiesSpringConfig.class);
	
	public PropertiesSpringConfig() {
		logger.info("<PropertiesSpringConfig");
		
		logger.info(">PropertiesSpringConfig");
	}

	@Bean
	static Properties systemProperties() throws IOException {
		logger.debug(">systemProperties()");
		Properties result = new Properties();
		
		Map<String, String> env = System.getenv();
		for (Entry<String, String> entry : env.entrySet()) {
			logger.debug("Fetching Environment Variable: {}", entry.getKey());
			result.setProperty(entry.getKey(), entry.getValue());
		}

		logger.debug("<systemProperties()");
		return result;
	}

	@Bean
	public static Properties applicationProperties() throws IOException {
		
		logger.debug(">applicationProperties()");
		Properties result;
		
		PropertiesFactoryBean propertiesFactory = new PropertiesFactoryBean();
		
		propertiesFactory.setLocalOverride(true);

		propertiesFactory.setPropertiesArray(bootstrapProperties(), systemProperties());
		propertiesFactory.setLocations(
				new ClassPathResource("static.properties"),
				new ClassPathResource("application-secrets.properties"),
				new ClassPathResource("application.properties") );
		
		propertiesFactory.afterPropertiesSet();
		
	    result =  propertiesFactory.getObject();
	    logger.debug("<applicationProperties()");
		return result;
	}

	@Bean
	public static Properties bootstrapProperties() {
		Properties result;
		logger.debug(">bootstrapProperties()");
		
		result = new Properties();
		
		logger.debug("<bootstrapProperties()");
		return result;
	}
	
	@Bean
	public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() throws IOException {
		PropertySourcesPlaceholderConfigurer result;
		
		result = new PropertySourcesPlaceholderConfigurer();
		result.setLocalOverride(false);
		result.setProperties(applicationProperties());
		
		return result;
	}
}
