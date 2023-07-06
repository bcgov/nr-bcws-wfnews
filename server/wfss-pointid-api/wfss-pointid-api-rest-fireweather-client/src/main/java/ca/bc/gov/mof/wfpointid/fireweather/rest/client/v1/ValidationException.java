package ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1;

import java.util.ArrayList;
import java.util.List;

import ca.bc.gov.mof.wfpointid.model.Message;

public class ValidationException extends Exception {
	
	private static final long serialVersionUID = 1L;
	
	private List<Message> messages = new ArrayList<>();

	public ValidationException(List<Message> messages) {
		super(messages==null||!messages.isEmpty()?null:messages.get(0).getMessageTemplate());
		this.messages = messages==null?this.messages:messages;
	}

	public List<Message> getMessages() {
		return messages;
	}
}
