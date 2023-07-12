package ca.bc.gov.nrs.wfone.api.rest.v1.spring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import ca.bc.gov.nrs.wfone.api.rest.v1.resource.factory.NotificationSettingsRsrcFactory;

@Configuration
public class ResourceFactorySpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(ResourceFactorySpringConfig.class);
	
	public ResourceFactorySpringConfig() {
		logger.info("<ResourceFactorySpringConfig");
		
		logger.info(">ResourceFactorySpringConfig");
	}
	
	@Bean
	public NotificationSettingsRsrcFactory notificationSettingsFactory() {
		
		NotificationSettingsRsrcFactory result = new NotificationSettingsRsrcFactory();
		
		return result;
	}
	
}
