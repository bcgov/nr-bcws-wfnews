package ca.bc.gov.nrs.wfone.service.api.v1.spring;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.ProxyFactoryBean;
import org.springframework.aop.target.HotSwappableTargetSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ca.bc.gov.nrs.wfdm.api.rest.client.FileService;
import ca.bc.gov.nrs.wfdm.api.rest.client.impl.FileServiceImpl;

/**
 * Configuration and Bean initialization for working with the WFDM
 * File Services.
 */
@Configuration
public class FileServiceSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(FileServiceSpringConfig.class);

	public FileServiceSpringConfig() {
		logger.debug("<FileServiceSpringConfig");
		
		logger.debug(">FileServiceSpringConfig");
	}
	
    private static final String Scopes = "WEBADE-REST.*,WFDM.*,WFIM.*";

	@Value("${webade-oauth2.client.id}")
	private String webadeOauth2ClientId;

	@Value("${webade-oauth2.wfone_notifictions_api_rest.client.secret}")
	private String webadeOauth2ClientSecret;

	@Value("${webade-oauth2.token.url}")
	private String webadeOauth2TokenUrl;

	@Value("${wfdm-rest.url}")
	private String topLevelRestURL;

	@Bean
	public FileService fileServiceImpl() {
		FileServiceImpl result;
		logger.debug("<fileServiceImpl clientId="+this.webadeOauth2ClientId+" tokenUrl="+this.webadeOauth2TokenUrl);

		result = new FileServiceImpl(webadeOauth2ClientId, webadeOauth2ClientSecret, webadeOauth2TokenUrl,Scopes);
		result.setTopLevelRestURL(topLevelRestURL);

		
		logger.debug(">fileServiceImpl");
		
		return result;
	}

	// The client is made hot swappable to support JUNIT tests.
	@Bean
	public HotSwappableTargetSource swappableFileService() {
		HotSwappableTargetSource result;

		result = new HotSwappableTargetSource(fileServiceImpl());
		return result;
	}

	// The swappable token client is proxied to support JUNIT tests.
	@Bean
	public ProxyFactoryBean fileService() {
		ProxyFactoryBean result;

		result =  new ProxyFactoryBean();
		result.setTargetSource(swappableFileService());
		return result;
	}
}
