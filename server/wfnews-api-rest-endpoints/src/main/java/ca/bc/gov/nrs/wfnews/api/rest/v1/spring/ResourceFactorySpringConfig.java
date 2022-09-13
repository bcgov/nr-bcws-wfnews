package ca.bc.gov.nrs.wfnews.api.rest.v1.spring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory.ExternalUriResourceFactory;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory.PublishedIncidentResourceFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.ExternalUriFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.PublishedIncidentFactory;

@Configuration
public class ResourceFactorySpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(ResourceFactorySpringConfig.class);

	public ResourceFactorySpringConfig() {
		logger.info("<ResourceFactorySpringConfig");
		logger.info(">ResourceFactorySpringConfig");
	}
	
	@Bean
	public PublishedIncidentFactory publishedIncidentFactory() {
		
		PublishedIncidentFactory result;
		result = new PublishedIncidentResourceFactory();
		
		return result;
	}
	
	@Bean
	public ExternalUriFactory externalUriFactory() {
		
		ExternalUriFactory result;
		result = new ExternalUriResourceFactory();
		
		return result;
	}
	
	
	
	
}
