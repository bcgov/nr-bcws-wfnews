package ca.bc.gov.nrs.wfnews.service.api.v1.impl;

import java.io.UnsupportedEncodingException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.MailResource;
import ca.bc.gov.nrs.wfnews.service.api.model.EmailNotificationType;
import ca.bc.gov.nrs.wfnews.service.api.v1.EmailNotificationService;
import ca.bc.gov.nrs.wfnews.service.api.v1.config.EmailNotificationConfig;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;

import software.amazon.awssdk.services.sns.model.PublishRequest;
import software.amazon.awssdk.services.sns.model.PublishResponse;
import software.amazon.awssdk.services.sns.model.SnsException;

public class EmailNotificationServiceImpl implements EmailNotificationService {

	private static final Logger logger = LoggerFactory.getLogger(EmailNotificationServiceImpl.class);

	private EmailNotificationConfig emailConfig;
	private Session emailSession;
	private InternetAddress[] toAddresses;
	private Instant lastGeneralEmailSent;
	private Map<String, Instant> errorExceptionMap = new HashMap<>();


	@Value("${WFNEWS_SNS_TOPIC_ARN}")
	private String topicArn;
	// We do not need access key id / secret access key when using container-based credentials
	// @Value("${WFNEWS_SNS_ACCESS_KEY}")
	// private String accessKey;
	// @Value("${WFNEWS_SNS_SECRET}")
	// private String secret;

	public EmailNotificationServiceImpl(EmailNotificationConfig emailConfig, Session emailSession) {
		logger.debug("<EmailNotificationServiceImpl");
		this.emailConfig = emailConfig;
		this.emailSession = emailSession;
		this.init();
		logger.info("EmailNotificationServiceEnabledInd: {}", emailConfig.getEmailNotificationsEnabledInd());
		
		logger.debug("EmailNotificationServiceImpl>");
	}

	private void init() {
		this.populateToAddresses(emailConfig.getRawAddresses());
	}

	@Override
	public void sendErrorMessage(String message, Exception e) throws UnsupportedEncodingException, MessagingException {
		sendErrorMessage(message, e, false);
	}

	@Override
	public void sendErrorMessage(String message, Exception e, boolean overrideFrequencyLimit) throws UnsupportedEncodingException, MessagingException {

		if(emailConfig.getEmailNotificationsEnabledInd()) {

			sendMessage(
				message,
				EmailNotificationType.Error,
				emailConfig.getEmailErrorSubjectTemplate(),
				"WFONE Notfications API Error:",
				emailConfig.getEmailFromAddress(),
				toAddresses,
				emailConfig.getRawAddresses(),
				e,
				overrideFrequencyLimit);

		}

	}

	private void sendMessage(
		String message,
		EmailNotificationType notificationType,
		String subjectTemplate,
		String emailBodyHeader,
		String fromEmailAddress,
		InternetAddress[] toEmailAddresses,
		String rawToEmailAddresses,
		Exception e,
		boolean overrideFrequencyLimit) throws MessagingException, UnsupportedEncodingException {

		String exceptionClassName = null;

		
		exceptionClassName = extractExceptionClassName(e);
	

		if(emailConfig.getEmailNotificationsEnabledInd() && canSendEmail(notificationType, exceptionClassName, overrideFrequencyLimit)) {

			if(!canSendEmail(notificationType, exceptionClassName, overrideFrequencyLimit)) {
				logger.info("not sending email type: {} as frequency limit has been exceeded.", notificationType);
				logger.debug("email body: {}", message);
			}

			MimeMessage mimeMessage = new MimeMessage(emailSession);
			mimeMessage.setSubject(subjectTemplate);

			mimeMessage.addRecipients(MimeMessage.RecipientType.TO, toEmailAddresses);
			InternetAddress emailFromAddess = new InternetAddress(fromEmailAddress, "BCWS WFONE");
      mimeMessage.setFrom(emailFromAddess);
      mimeMessage.setSender(emailFromAddess);

			StringBuilder text = new StringBuilder();

			text.append("<h3>" + emailBodyHeader + "</h3>");

			text.append(message + " " + e.getMessage());
			
			mimeMessage.setContent(text.toString(), "text/html");
			logger.info("Send Email to " + rawToEmailAddresses);
			Transport.send(mimeMessage);

		}

	}

	private boolean canSendEmail(EmailNotificationType notificationType, String exceptionClassName, boolean overrideFrequencyLimit) {

		if(notificationType == EmailNotificationType.General) {
			return canSendGeneralEmail(overrideFrequencyLimit);
		}

		if(notificationType == EmailNotificationType.Error) {
			return canSendErrorEmail(exceptionClassName, overrideFrequencyLimit);
		}

		return false;
	}

	private boolean canSendGeneralEmail(boolean overrideFrequencyLimit) {

		if(overrideFrequencyLimit) {
			return true;
		}

		if(lastGeneralEmailSent == null) {
			return true;
		} else {
			long elapsedTime = (Instant.now().toEpochMilli()) - (lastGeneralEmailSent.toEpochMilli());
			return  elapsedTime > emailConfig.getEmailFrequency();
		}

	}

	private boolean canSendErrorEmail(String exceptionClassName, boolean overrideFrequencyLimit) {
		logger.debug("<canSendErrorEmail");

		Instant lastErrorEmailSent = null;

		if(overrideFrequencyLimit) {
			return true;
		}

		lastErrorEmailSent = (Instant)errorExceptionMap.get(exceptionClassName);

		if(lastErrorEmailSent == null) {
			return true;
		} else {
			long elapsedTime = (Instant.now().toEpochMilli()) - (lastErrorEmailSent.toEpochMilli());
			logger.debug("error email elapsed time epochmilli: {}, exceptionClassName: {}", elapsedTime, exceptionClassName);
			return elapsedTime > emailConfig.getEmailErrorFrequency();
		}

	}

	private void populateToAddresses(String rawAddresses) {

		try {

			if(rawAddresses==null) {
				this.toAddresses = new InternetAddress[] {};
			} else {
				String[] split = rawAddresses.split(";");

				this.toAddresses = new InternetAddress[split.length];

				for(int i=0;i<split.length;++i) {

					this.toAddresses[i] = new InternetAddress(split[i]);
				}
			}
		} catch (AddressException e) {
			throw new RuntimeException(e);
		}
	}

	private String extractExceptionClassName(Exception e) {

		if(e.getCause() == null) {
			logger.debug("Exception e.getClass().getName(): {}", e.getClass().getName());
			return e.getClass().getName();
		}

		logger.debug("Exception e.getCause().getClass().getName(): {}", e.getCause().getClass().getName());
		return e.getCause().getClass().getName();

	}

	/**
	 * Send Message implementation for SNS messages.
	 */
	public boolean sendMessage(MailResource mail) {
		logger.debug(" >> sendMessage");
		SnsClient snsClient = null;
		try {
			logger.debug("Configure SNS Client");
			snsClient = SnsClient.builder().region(Region.CA_CENTRAL_1).build();

			// Then, publish a message to SNS using the client established on startup
			PublishRequest request = PublishRequest.builder().message("Name: " + mail.getName() + "\nSubject: " + mail.getSubject() + "\nAddress: " + mail.getEmailAddress() + "\n Message:\n" + mail.getMessageBody()).topicArn(topicArn).build();
			PublishResponse result = snsClient.publish(request);
			// If we dont have a result, or the ID is null, we can assume a failure
			// If we do have a result, check for an OK response.
			if (result != null && result.messageId() != null) {
				logger.info("SNS Message response ID: {}", result.messageId());
				logger.info("SNS Message Status: {}", result.sdkHttpResponse().statusCode());
				return result.sdkHttpResponse().statusCode() == 200;
			} else {
				return false;
			}
		} catch (SnsException e) {
				// on a failure, log the error and return false
				logger.error("Failed to send message to SNS: " + e.awsErrorDetails().errorMessage(), e);
				return false;
		} finally {
			logger.debug(" << sendMessage");
			if (snsClient != null) {
				snsClient.close();
				snsClient = null;
			}
		}
	}
}
