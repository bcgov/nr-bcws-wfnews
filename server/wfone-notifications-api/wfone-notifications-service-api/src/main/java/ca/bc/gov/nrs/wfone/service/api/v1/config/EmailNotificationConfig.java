package ca.bc.gov.nrs.wfone.service.api.v1.config;

public class EmailNotificationConfig {

	private Boolean emailNotificationsEnabledInd;
	private long emailFrequency;
	private long emailErrorFrequency;
	private String emailSubjectTemplate;
	private String emailErrorSubjectTemplate;
	private String rawAddresses;
	private String emailHostName;
	private int emailPort;
	private String emailFromAddress;

	public Boolean getEmailNotificationsEnabledInd() {
		return emailNotificationsEnabledInd;
	}

	public void setEmailNotificationsEnabledInd(Boolean emailNotificationsEnabledInd) {
		this.emailNotificationsEnabledInd = emailNotificationsEnabledInd;
	}

	public long getEmailFrequency() {
		return emailFrequency;
	}

	public void setEmailFrequency(long emailFrequency) {
		this.emailFrequency = emailFrequency;
	}

	public long getEmailErrorFrequency() {
		return emailErrorFrequency;
	}

	public void setEmailErrorFrequency(long emailErrorFrequency) {
		this.emailErrorFrequency = emailErrorFrequency;
	}

	public String getEmailSubjectTemplate() {
		return emailSubjectTemplate;
	}

	public void setEmailSubjectTemplate(String emailSubjectTemplate) {
		this.emailSubjectTemplate = emailSubjectTemplate;
	}

	public String getEmailErrorSubjectTemplate() {
		return emailErrorSubjectTemplate;
	}

	public void setEmailErrorSubjectTemplate(String emailErrorSubjectTemplate) {
		this.emailErrorSubjectTemplate = emailErrorSubjectTemplate;
	}

	public String getRawAddresses() {
		return rawAddresses;
	}

	public void setRawAddresses(String rawAddresses) {
		this.rawAddresses = rawAddresses;
	}

	public String getEmailHostName() {
		return emailHostName;
	}

	public void setEmailHostName(String emailHostName) {
		this.emailHostName = emailHostName;
	}

	public int getEmailPort() {
		return emailPort;
	}

	public void setEmailPort(int emailPort) {
		this.emailPort = emailPort;
	}

	public String getEmailFromAddress() {
		return emailFromAddress;
	}

	public void setEmailFromAddress(String emailFromAddress) {
		this.emailFromAddress = emailFromAddress;
	}

}
