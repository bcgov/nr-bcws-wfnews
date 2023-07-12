package ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.spring;

import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.spring.PersistenceSpringConfig;
import org.apache.commons.dbcp2.BasicDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.support.ResourceBundleMessageSource;

import ca.bc.gov.nrs.wfone.common.checkhealth.CheckHealthValidator;
import ca.bc.gov.nrs.wfone.common.checkhealth.CompositeValidator;
import ca.bc.gov.nrs.wfone.common.utils.ApplicationContextProvider;
import ca.bc.gov.nrs.wfone.notification.push.api.rest.v1.parameters.validation.ParameterValidator;
import ca.bc.gov.nrs.wfone.notification.push.quartz.scheduler.spring.QuartzSchedulerSpringConfig;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.spring.ServiceApiSpringConfig;

@Configuration
@Import({
	PropertiesSpringConfig.class
	,ServiceApiSpringConfig.class
	,ResourceFactorySpringConfig.class
	,PersistenceSpringConfig.class
	,SecuritySpringConfig.class,
  QuartzSchedulerSpringConfig.class
})
public class EndpointsSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(EndpointsSpringConfig.class);
	
	public EndpointsSpringConfig() {
		logger.info("<EndpointsSpringConfig");
		
		logger.info(">EndpointsSpringConfig");
	}

	// Imported Spring Config
	@Autowired PersistenceSpringConfig persistenceSpringConfig;
	
	@Bean
	public ApplicationContextProvider applicationContextProvider() {
		ApplicationContextProvider result;
		
		result = new ApplicationContextProvider();
		
		return result;
	}
	
	@Bean 
	public DataSource codeTableDataSource() {
		DataSource result;
		
	    result = persistenceSpringConfig.wfoneDataSource();
	    
	    return result;
	}

	@Bean
	public ResourceBundleMessageSource messageSource() {
		ResourceBundleMessageSource result;
		
		result = new ResourceBundleMessageSource();
		result.setBasename("messages");
		
		return result;
	}

	@Bean
	public ParameterValidator parameterValidator() {
		ParameterValidator result;
		
		result = new ParameterValidator();
		result.setMessageSource(messageSource());
		
		return result;
	}

	@Bean(initMethod="init")
	public CompositeValidator checkHealthValidator() {
		CompositeValidator result;
		
		result = new CompositeValidator();
		result.setComponentIdentifier("WFONE_NOTIFICATIONS_PUSH_API");
		result.setComponentName("Wildfire Notifications Push Rest API");
		result.setValidators(healthCheckValidators());
		
		return result;
	}

	@Bean()
	public List<CheckHealthValidator> healthCheckValidators() {
		List<CheckHealthValidator> result = new ArrayList<>();
		
		return result;
	}

}
