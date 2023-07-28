package ca.bc.gov.nrs.wfone.service.api.v1.impl;

import ca.bc.gov.nrs.wfone.service.api.v1.EmailNotificationService;
import ca.bc.gov.nrs.wfone.service.api.v1.config.EmailNotificationConfig;
import ca.bc.gov.nrs.wfone.service.api.v1.impl.HealthCheckUtils.ServiceWithHealthCheck;
import ca.bc.gov.nrs.common.wfone.rest.resource.HealthCheckResponseRsrc;
import ca.bc.gov.nrs.wfdm.api.rest.client.FileService;
import ca.bc.gov.nrs.wfone.service.api.model.EmailNotificationType;
import ca.bc.gov.nrs.wfone.service.api.model.RoFRetryInfo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class EmailNotificationServiceImpl implements EmailNotificationService {

	private static final Logger logger = LoggerFactory.getLogger(EmailNotificationServiceImpl.class);

	private EmailNotificationConfig emailConfig;
	private Session emailSession;
	private InternetAddress[] toAddresses;
	private Instant lastGeneralEmailSent;
	private Map<String, Instant> errorExceptionMap = new HashMap<>();

	@Value("${WFIM_CLIENT_URL}")
	private String wfimClientUrl;
	
	@Value("${DEFAULT_APPLICATION_ENVIRONMENT}")
	private String environment;

	private FileService fileService;
	
	private ServiceWithHealthCheck incidentService;
	
	public FileService getFileService() {
		return fileService;
	}

	public void setFileService(FileService fileService) {
		this.fileService = fileService;
	}

	public ServiceWithHealthCheck getIncidentService() {
		if(Objects.isNull(incidentService)) {
			incidentService = HealthCheckUtils.makeHealthCheckStub(this.wfimClientUrl);
		}
		return incidentService;
	}

	public void setIncidentService(ServiceWithHealthCheck incidentService) {
		this.incidentService = incidentService;
	}

	public EmailNotificationServiceImpl(EmailNotificationConfig emailConfig, Session emailSession) {
		logger.debug("<EmailNotificationServiceImpl");
		this.emailConfig = emailConfig;
		this.emailSession = emailSession;
		this.init();
		logger.info("EmailNotificationServiceEnabledInd: {}", emailConfig.getEmailNotificationsEnabledInd());
		logger.debug("EmailNotificationServiceImpl>");
	}

	public String getEnvironment() {
		return environment;
	}

	public void setEnvironment(String environment) {
		this.environment = environment;
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
			doSend(mimeMessage);

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
		if(e==null) {
			return null;
		}
		if(e.getCause() == null) {
			logger.debug("Exception e.getClass().getName(): {}", e.getClass().getName());
			return e.getClass().getName();
		}

		logger.debug("Exception e.getCause().getClass().getName(): {}", e.getCause().getClass().getName());
		return e.getCause().getClass().getName();

	}

	@FunctionalInterface
	public static interface MessageBuilder {
		void accept(MimeMessage msg) throws MessagingException;
	}
	
	protected void sendErrorNotification(Exception e, boolean overrideFrequencyLimit, MessageBuilder closure) throws MessagingException, UnsupportedEncodingException {
		
		sendNotification(EmailNotificationType.Error, e, overrideFrequencyLimit, closure);
	}
	
	protected void sendGeneralNotification(boolean overrideFrequencyLimit, MessageBuilder closure) throws MessagingException, UnsupportedEncodingException {
		
		sendNotification(EmailNotificationType.General, null, overrideFrequencyLimit, closure);
	}
	
	protected void sendNotification(EmailNotificationType notificationType, Exception e, boolean overrideFrequencyLimit, MessageBuilder closure) throws MessagingException, UnsupportedEncodingException {
		
		String exceptionClassName = extractExceptionClassName(e);
		
		String fromEmailAddress = emailConfig.getEmailFromAddress();
		String rawToEmailAddresses = emailConfig.getRawAddresses();

		if(emailConfig.getEmailNotificationsEnabledInd() && canSendEmail(notificationType, exceptionClassName, overrideFrequencyLimit)) {

			MimeMessage mimeMessage = new MimeMessage(emailSession);

			mimeMessage.addRecipients(MimeMessage.RecipientType.TO, toAddresses);
			InternetAddress emailFromAddess = new InternetAddress(fromEmailAddress, "BCWS WFONE");
			mimeMessage.setFrom(emailFromAddess);
			mimeMessage.setSender(emailFromAddess);

			closure.accept(mimeMessage);
			
			logger.info("Send Email to " + rawToEmailAddresses);
			doSend(mimeMessage);

		}
	}
	
	void doSend(MimeMessage mimeMessage) throws MessagingException {
		Transport.send(mimeMessage);
	}
	
	private void appendHealthCheck(PrintWriter text, String serviceName, Object service) {
		String icon;
		String details;
		
		try {		
			HealthCheckResponseRsrc result = HealthCheckUtils.checkHealth(service);
			icon = HealthCheckUtils.statusEmoji(result.getValidationStatus());
			details = result.getStatusDetails();
		} catch (Exception ex) {
			icon = "⚠️";
			details = "Error while performing health check: "+ ex.getMessage();
			logger.error("Error while performing health check on "+serviceName, ex);
		}
		
		text.append("<dt>")
			.append(serviceName)
			.append("</dt>");
		
		text.append("<dd>")
			.append(icon)
			.append(" ")
			.append(details)
			.append("</dd>");
		
	}

	@Override
	public void sendRoFsStuckMessage(String serializedRof, String rofGuid, Exception ex, String failedPushAction) throws UnsupportedEncodingException, MessagingException {

		sendErrorNotification(ex, false, message->{
			StringWriter buffer = new StringWriter(); 
			PrintWriter text = new PrintWriter(buffer); // Use PrintWriter so we can write a stack trace to it.
			
			message.setSubject("["+environment+"] Public Report of Fire Submit Failure");
					
			text.append("<p>")
				.append("A Public Report of Fire with ID=<tt>")
				.append(rofGuid)
				.append("</tt> has failed to Submit to the WFIM <tt>")
				.append(this.wfimClientUrl)
				.append("</tt> while trying to ")
				.append(failedPushAction)
				.append("</tt>.  This submission will be retried with exponential back-off.")
				.append("</p>");
			
			appendSystemHealth(text);
			
			text.append("<h3>")
				.append("Reason")
				.append("</h3>");
			
			text.append("<pre>");
			ex.printStackTrace(text);
			text.append("</pre>");

			text.append("<h3>")
				.append("ROF Detail")
				.append("</h3>");
			
			text.append("<pre>")
				.append(serializedRof)
				.append("</pre>");
			
			message.setContent(buffer.toString(), "text/html");
		});

	}

	private void appendSystemHealth(PrintWriter text) {
		text.append("<h3>")
			.append("System Health")
			.append("</h3>");
		
		text.append("<dl>");
		appendHealthCheck(text, "WFIM", incidentService);
		appendHealthCheck(text, "WFDM", fileService);
		text.append("</dl>");
	}

	@Override
	public void sendServiceDegradedMessage(List<RoFRetryInfo> stuckRequests, String lastFailure)
			throws UnsupportedEncodingException, MessagingException {
		sendGeneralNotification(true, message->{
			StringWriter buffer = new StringWriter(); 
			PrintWriter text = new PrintWriter(buffer); // Use PrintWriter so we can write a stack trace to it.
			
			message.setSubject("["+environment+"] Public Report of Fire Service Degraded");
			
			
			text.append("<p>")
				.append("The Public Report of Fire service is currently running in degraded mode.  The system has detected that there are ")
				.append(Integer.toString(stuckRequests.size()))
				.append(" Public Reports of Fire waiting to be delivered to WFIM. ")
				.append("</p>");
			
			appendSystemHealth(text);
			
			text.append("<h3>")
				.append("Last Service Error")
				.append("</h3>");
			
			text.append("<p>")
				.append(lastFailure)
				.append("</p>");

			text.append("<h3>")
				.append("ROF Cache Detail")
				.append("</h3>");
			
			text.append("<table><thead><tr><th>RoF Cache GUID</th><th>Retries</th><th>Next Retry</th></tr></thead><tbody>");
			
			for(RoFRetryInfo request: stuckRequests) {
				text.append("<tr><td><tt>")
					.append(request.getRofCacheGuid())
					.append("</tt></td><td>")
					.append(Integer.toString(request.getRetries()))
					.append("</td><td>")
					.append(request.getNextRetry().toString())
					.append("</td></tr>");
			}
			
			text.append("</tbody></table>");
			
			message.setContent(buffer.toString(), "text/html");
		});
	}
	
	@Override
	public void sendServiceRestoredMessage() throws UnsupportedEncodingException, MessagingException {
		sendGeneralNotification(true, message->{
			StringWriter buffer = new StringWriter(); 
			PrintWriter text = new PrintWriter(buffer);
			
			message.setSubject("["+environment+"] Public Report of Fire Service Restored");
			
			
			text.append("<p>")
				.append("The Public Report of Fire service is no longer degraded. ")
				.append("</p>");
			
			message.setContent(buffer.toString(), "text/html");
		});
	}

}
