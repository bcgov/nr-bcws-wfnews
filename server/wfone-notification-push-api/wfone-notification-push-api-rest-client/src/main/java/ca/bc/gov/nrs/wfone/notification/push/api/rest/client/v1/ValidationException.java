package ca.bc.gov.nrs.wfone.notification.push.api.rest.client.v1;

import java.util.ArrayList;
import java.util.List;

import ca.bc.gov.nrs.wfone.common.model.Message;

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
