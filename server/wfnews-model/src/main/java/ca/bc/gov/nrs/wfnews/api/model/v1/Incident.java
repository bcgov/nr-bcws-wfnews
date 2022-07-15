package ca.bc.gov.nrs.wfnews.api.model.v1;

import java.util.List;

import ca.bc.gov.nrs.wfone.common.model.Message;

public interface Incident {
	
	public List<Message> getErrorMessages();
	public void setErrorMessages(List<Message> errorMessages);
}