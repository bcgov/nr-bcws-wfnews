package ca.bc.gov.nrs.wfnews.api.rest.v1.spring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ResourceFactorySpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(ResourceFactorySpringConfig.class);

	public ResourceFactorySpringConfig() {
		logger.info("<ResourceFactorySpringConfig");
		logger.info(">ResourceFactorySpringConfig");
	}
}
