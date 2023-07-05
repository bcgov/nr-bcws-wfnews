package ca.bc.gov.nrs.wfnews.api.rest.v1.spring;

import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import ca.bc.gov.nrs.wfnews.api.rest.v1.common.AttachmentsAwsConfig;
import org.apache.commons.dbcp2.BasicDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.support.ResourceBundleMessageSource;

import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation.ParameterValidator;
import ca.bc.gov.nrs.wfnews.service.api.v1.spring.ServiceApiSpringConfig;
import ca.bc.gov.nrs.wfone.common.checkhealth.CheckHealthValidator;
import ca.bc.gov.nrs.wfone.common.checkhealth.CompositeValidator;
import ca.bc.gov.nrs.wfone.common.utils.ApplicationContextProvider;

@Configuration
@Import({
	PropertiesSpringConfig.class
	,ServiceApiSpringConfig.class
	,ResourceFactorySpringConfig.class
	,SecuritySpringConfig.class
	,WebConfig.class
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
	
	@Value("${WFNEWS_DB_URL}")
	private String wfoneDataSourceUrl;
	
	@Value("${WFNEWS_USERNAME}")
	private String wfoneDataSourceUsername;
	
	@Value("${DB_PASS}")
	private String wfoneDataSourcePassword;
	
	@Value("${WFNEWS_MAX_CONNECTIONS}")
	private String wfoneDataSourceMaxConnections;

	@Value("${WFNEWS_S3_BUCKET_NAME}")
	private String attachmentsBucketName;

	@Value("${AWS_REGION}")
	private String regionName;

	@Value("${WFNEWS_ACCESS_KEY_ID}")
	private String awsAccessKeyId;

	@Value("${WFNEWS_SECRET_ACCESS_KEY}")
	private String awsSecretAccessKey;

	@Bean
	public DataSource wfoneDataSource() {
		logger.debug(   "Creating datasource for " + wfoneDataSourceUrl );

		String dbUrl = wfoneDataSourceUrl;
		BasicDataSource result = new BasicDataSource();

		 result.setUsername(wfoneDataSourceUsername);
		 result.setPassword(wfoneDataSourcePassword);
		 result.setDriverClassName(org.postgresql.Driver.class.getName());
		 result.setUrl(dbUrl);
		 result.setInitialSize(1);
		 logger.debug("wfoneDataSourceMaxConnections="+wfoneDataSourceMaxConnections);
		 result.setMaxTotal(Integer.parseInt(wfoneDataSourceMaxConnections));
		 result.setValidationQuery("SELECT 1");

		return result;
	}

	@Bean
	public AttachmentsAwsConfig getAttachmentsAwsConfig(){
		return new AttachmentsAwsConfig(attachmentsBucketName, regionName, awsAccessKeyId, awsSecretAccessKey);
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
		result.setComponentIdentifier("WFNEWS_API");
		result.setComponentName("Wildfire News Rest API");
		result.setValidators(healthCheckValidators());
		
		return result;
	}

	@Bean()
	public List<CheckHealthValidator> healthCheckValidators() {
		List<CheckHealthValidator> result = new ArrayList<>();
		return result;
	}

}
