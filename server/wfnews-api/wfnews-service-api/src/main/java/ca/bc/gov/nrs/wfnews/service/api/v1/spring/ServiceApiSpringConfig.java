package ca.bc.gov.nrs.wfnews.service.api.v1.spring;

import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.support.ResourceBundleMessageSource;

import ca.bc.gov.nrs.wfnews.persistence.v1.spring.PersistenceSpringConfig;
import ca.bc.gov.nrs.wfnews.service.api.v1.EmailNotificationService;
import ca.bc.gov.nrs.wfnews.service.api.v1.IncidentsService;
import ca.bc.gov.nrs.wfnews.service.api.v1.config.EmailNotificationConfig;
import ca.bc.gov.nrs.wfnews.service.api.v1.impl.EmailNotificationServiceImpl;
import ca.bc.gov.nrs.wfnews.service.api.v1.impl.IncidentsServiceImpl;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.AttachmentFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.ExternalUriFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.PublishedIncidentFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.SituationReportFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.StatisticsFactory;
import ca.bc.gov.nrs.wfnews.service.api.v1.validation.ModelValidator;

@Configuration
@Import({
	PersistenceSpringConfig.class,
	// FileServiceSpringConfig.class
//	TokenServiceSpringConfig.class
})
public class ServiceApiSpringConfig {

	private static final Logger logger = LoggerFactory.getLogger(ServiceApiSpringConfig.class);
	
	public ServiceApiSpringConfig() {
		logger.debug("<ServiceApiSpringConfig");
		
		logger.debug(">ServiceApiSpringConfig");
	}
	
	@Value("${SMTP_HOST_NAME}")
	private String emailHostName;
	
	@Value("${SMTP_FROM_EMAIL}")
	private String emailHostUser;

	@Value("${SMTP_PASSWORD}")
	private String emailHostPassword;

	@Value("${SMTP_FROM_EMAIL}")
	private String emailFromAddress;
	
	@Value("${WFNEWS_EMAIL_NOTIFICATIONS_ENABLED_IND}")
	private Boolean emailNotificationsEnabledInd;
	
	@Value("${SMTP_ADMIN_EMAIL}")
	private String rawAddresses;
	
	@Value("${SMTP_EMAIL_SUBJECT}")
	private String emailSubjectTemplate;
	
	@Value("${SMTP_EMAIL_ERROR_SUBJECT}")
	private String emailErrorSubjectTemplate;
	
	@Value("${SMTP_EMAIL_SYNC_ERROR_FREQ}")
	private String emailErrorFrequency;
	
	@Value("${SMTP_EMAIL_FREQ}")
	private String emailFrequency;
		
	// Beans provided by EndpointsSpringConfig
	@Autowired ResourceBundleMessageSource messageSource;
	@Autowired Properties applicationProperties;

	// Imported Spring Config
	@Autowired PersistenceSpringConfig persistenceSpringConfig;
	
	@Autowired PublishedIncidentFactory publishedIncidentFactory;
	@Autowired ExternalUriFactory externalUriFactory;
	@Autowired AttachmentFactory attachmentFactory;
	@Autowired SituationReportFactory situationReportFactory;
	@Autowired StatisticsFactory statisticsFactory;
	
	
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
	
	@Bean
	public IncidentsService incidentsService() {

		IncidentsServiceImpl result = new IncidentsServiceImpl();
		result.setPublishedIncidentDao(persistenceSpringConfig.publishedIncidentDao());
		result.setExternalUriDao(persistenceSpringConfig.externalUriDao());
		result.setPublishedIncidentFactory(publishedIncidentFactory);
		result.setExternalUriFactory(externalUriFactory);
		result.setAttachmentDao(persistenceSpringConfig.attachmentDao());
		result.setAttachmentFactory(attachmentFactory);
		result.setSituationReportFactory(situationReportFactory);
		result.setSituationReportDao(persistenceSpringConfig.situationReportDao());
		result.setStatisticsDao(persistenceSpringConfig.statisticsDao());
		result.setStatisticsFactory(statisticsFactory);
		
		return result;
	}
	
	
	
	
	
}
