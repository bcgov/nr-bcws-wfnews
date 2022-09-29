package ca.bc.gov.nrs.wfnews.spring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.PropertiesFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.util.Properties;

@Configuration
public class PropertiesSpringConfig {
	private static final Logger logger = LoggerFactory.getLogger(PropertiesSpringConfig.class);
	
	public PropertiesSpringConfig() {
		logger.info("<PropertiesSpringConfig");
		logger.info(">PropertiesSpringConfig");
	}

	@Bean
	public static Properties applicationProperties() throws IOException {
		Properties result;
		
		PropertiesFactoryBean propertiesFactory = new PropertiesFactoryBean();
		propertiesFactory.setLocalOverride(true);
		propertiesFactory.setLocation(new ClassPathResource("static.properties"));
		propertiesFactory.afterPropertiesSet();
		
	    result =  propertiesFactory.getObject();
		
		return result;
	}

	@Bean
	public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() throws IOException {
		PropertySourcesPlaceholderConfigurer result;
		
		result = new PropertySourcesPlaceholderConfigurer();
		result.setProperties(applicationProperties());
		
		return result;
	}
}
