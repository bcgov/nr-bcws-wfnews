package ca.bc.gov.nrs.wfnews.service.api.v1.spring;

import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.beans.factory.annotation.Value;

import ca.bc.gov.nrs.wfdm.api.rest.client.FileService;
import ca.bc.gov.nrs.wfnews.persistence.v1.spring.PersistenceSpringConfig;
import ca.bc.gov.nrs.wfnews.service.api.v1.config.EmailNotificationConfig;
import ca.bc.gov.nrs.wfnews.service.api.v1.validation.ModelValidator;
import ca.bc.gov.nrs.wfnews.service.api.v1.EmailNotificationService;
import ca.bc.gov.nrs.wfnews.service.api.v1.impl.EmailNotificationServiceImpl;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;

@Configuration
@Import({
	PersistenceSpringConfig.class,
	FileServiceSpringConfig.class
//	TokenServiceSpringConfig.class
})
public class ServiceApiSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(ServiceApiSpringConfig.class);
	
	public ServiceApiSpringConfig() {
		logger.debug("<ServiceApiSpringConfig");
		
		logger.debug(">ServiceApiSpringConfig");
	}
	
	@Value("${wfone.smtp.host.name}")
	private String emailHostName;
	
	@Value("${wfone.smtp.credentials.user}")
	private String emailHostUser;

	@Value("${wfone.smtp.credentials.password}")
	private String emailHostPassword;

	@Value("${wfone.email.from.address}")
	private String emailFromAddress;
	
	@Value("${wfone.email.notifications.enabled.ind}")
	private Boolean emailNotificationsEnabledInd;
	
	@Value("${wfone.email.admin.address}")
	private String rawAddresses;
	
	@Value("${wfone.email.sync.subject}")
	private String emailSubjectTemplate;
	
	@Value("${wfone.email.sync.error.subject}")
	private String emailErrorSubjectTemplate;
	
	@Value("${wfone.email.sync.send.error.frequency}")
	private String emailErrorFrequency;
	
	@Value("${wfone.email.sync.send.frequency}")
	private String emailFrequency;

	// Beans provided by EndpointsSpringConfig
	@Autowired ResourceBundleMessageSource messageSource;
	@Autowired Properties applicationProperties;

	// Imported Spring Config
	@Autowired PersistenceSpringConfig persistenceSpringConfig;

	// Beans provided by FileServiceSpringConfig
	// This allows Spring to use the proxied service
	@Autowired
	FileService fileService;
	
	@Bean
	public ModelValidator modelValidator() {
		ModelValidator result;
		
		result = new ModelValidator();
		result.setMessageSource(messageSource);
		
		return result;
	}

	@Bean
	public Session emailSession() {
		logger.debug("<emailSession");
		Session result;

		Properties mailProperties = new Properties();
		mailProperties.setProperty("mail.smtp.host", emailHostName);
		mailProperties.setProperty("mail.smtp.port", "9999"); // move to config
		mailProperties.setProperty("mail.from.address", emailFromAddress);
		mailProperties.put("mail.smtp.starttls.enable", true);
		mailProperties.put("mail.smtp.auth", true);

		result = Session.getDefaultInstance(mailProperties, new Authenticator() {
			@Override
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(emailHostUser, emailHostPassword);
			}
		});

		logger.debug(">emailSession");
		return result;
	}
	
	@Bean()
	public EmailNotificationConfig errorEmailNotificationConfig() {

		EmailNotificationConfig result = new EmailNotificationConfig();
		result.setEmailNotificationsEnabledInd(emailNotificationsEnabledInd);
		result.setEmailHostName(emailHostName);
		result.setEmailPort(Integer.parseInt("9999")); // move to config
		result.setEmailFromAddress(emailFromAddress);
		result.setRawAddresses(rawAddresses);
		result.setEmailFrequency(emailFrequency());
		result.setEmailErrorFrequency(emailErrorFrequency());
		result.setEmailSubjectTemplate(emailSubjectTemplate);
		result.setEmailErrorSubjectTemplate(emailErrorSubjectTemplate);

		return result;
	}

	@Bean()
	public EmailNotificationService errorEmailNotificationService() {

		EmailNotificationServiceImpl result = new EmailNotificationServiceImpl(errorEmailNotificationConfig(), emailSession());
		return result;

	}
	
	public long emailFrequency() {
		long result = 10*1000*60;

		if(emailFrequency!=null) {

			result = Long.valueOf(emailFrequency).longValue();
		}

		return result;
	}
	
	public long emailErrorFrequency() {
		long result = 10*1000*60;

		if(emailErrorFrequency!=null) {

			result = Long.valueOf(emailErrorFrequency).longValue();
		}

		return result;
	}
	

}
