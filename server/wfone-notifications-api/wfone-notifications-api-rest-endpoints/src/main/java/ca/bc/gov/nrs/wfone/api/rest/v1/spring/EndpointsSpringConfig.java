package ca.bc.gov.nrs.wfone.api.rest.v1.spring;

import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.apache.commons.dbcp2.BasicDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.support.ResourceBundleMessageSource;

import ca.bc.gov.nrs.wfone.api.rest.v1.parameters.validation.ParameterValidator;
import ca.bc.gov.nrs.wfone.common.checkhealth.CheckHealthValidator;
import ca.bc.gov.nrs.wfone.common.checkhealth.CompositeValidator;
import ca.bc.gov.nrs.wfone.common.utils.ApplicationContextProvider;
import ca.bc.gov.nrs.wfone.notifications.quartz.scheduler.spring.QuartzSchedulerSpringConfig;
import ca.bc.gov.nrs.wfone.service.api.v1.spring.ServiceApiSpringConfig;

@Configuration
@Import({
	PropertiesSpringConfig.class
	,ServiceApiSpringConfig.class
	,ResourceFactorySpringConfig.class
	,SecuritySpringConfig.class
	,QuartzSchedulerSpringConfig.class
	,CorsFilter.class
})
public class EndpointsSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(EndpointsSpringConfig.class);
	
	public EndpointsSpringConfig() {
		logger.info("<EndpointsSpringConfig");
		
		logger.info(">EndpointsSpringConfig");
	}
	
	@Bean
	public ApplicationContextProvider applicationContextProvider() {
		ApplicationContextProvider result;
		
		result = new ApplicationContextProvider();
		
		return result;
	}
	
	@Value("${DATASOURCE_URL}")
	private String wfoneDataSourceUrl;
	
	@Value("${DATASOURCE_USER}")
	private String wfoneDataSourceUsername;
	
	@Value("${DATASOURCE_PASSWORD}")
	private String wfoneDataSourcePassword;
	
	@Value("${DATASOURCE_MAX_CONNECTIONS}")
	private String wfoneDataSourceMaxConnections;

	@Bean
	public DataSource wfoneDataSource() {
		logger.debug("Creating datasource for " + wfoneDataSourceUrl);

		String dbUrl = wfoneDataSourceUrl;
		BasicDataSource result = new BasicDataSource();

		result.setUsername(wfoneDataSourceUsername);
		result.setPassword(wfoneDataSourcePassword);
		result.setDriverClassName(org.postgresql.Driver.class.getName());
		result.setUrl(dbUrl);
		result.setInitialSize(1);
		logger.debug("wfoneDataSourceMaxConnections="+wfoneDataSourceMaxConnections);
		result.setMaxTotal(Integer.parseInt(wfoneDataSourceMaxConnections));

		return result;
	}
	
	@Bean 
	public DataSource codeTableDataSource() {
		DataSource result;
		
	    result = wfoneDataSource();
	    
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
		result.setComponentIdentifier("WFONE_NOTIFICATIONS_API");
		result.setComponentName("Wildfire Notifications Rest API");
		result.setValidators(healthCheckValidators());
		
		return result;
	}

	@Bean()
	public List<CheckHealthValidator> healthCheckValidators() {
		List<CheckHealthValidator> result = new ArrayList<>();
		return result;
	}

}
