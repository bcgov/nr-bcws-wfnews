package ca.bc.gov.nrs.wfone.api.model.v1;

import java.io.Serializable;
import java.util.Date;

public interface IncidentMessage extends Serializable {

	public String getMessageTypeCode();
	public void setMessageTypeCode(String messageTypeCode);

	public Date getMessageReceivedTimestamp();
	public void setMessageReceivedTimestamp(Date messageReceivedTimestamp);

	public String getMessageStatusCode();
	public void setMessageStatusCode(String messageStatusCode);

	public String getMessageStatusUserId();
	public void setMessageStatusUserId(String messageStatusUserId);

	public String getMessageStatusUserGuid();
	public void setMessageStatusUserGuid(String messageStatusUserGuid);

	public Date getMessageStatusTimestamp();
	public void setMessageStatusTimestamp(Date messageStatusTimestamp);

	public Integer getIncidentWildfireYear();
	public void setIncidentWildfireYear(Integer incidentWildfireYear);

	public Long getIncidentNumberSequence();
	public void setIncidentNumberSequence(Long incidentNumberSequence);

	public String getIncidentLabel();
	public void setIncidentLabel(String incidentLabel);
	
    public String getMessageReceivedSource();
    public void setMessageReceivedSource(String messageReceivedSource);
	
}