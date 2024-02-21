package ca.bc.gov.nrs.wfnews.api.rest.client.v1.exception;

import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.model.Message;

public class ValidationException extends Exception {
	
	private static final Logger logger = LoggerFactory.getLogger(ValidationException.class);
	
	private static final long serialVersionUID = 1L;
	
	private List<Message> messages = new ArrayList<>();
	private String message;

	public ValidationException(List<Message> messages) {
		super(messages==null||!messages.isEmpty()?null:messages.get(0).getMessageTemplate());
		this.messages = messages==null?this.messages:messages;
		for (Message msg : messages) {
			logger.debug(msg.getMessage());
		}
	}

	public ValidationException(String message) {
		super(message);
		this.message = message;
		logger.debug(message);
	}

	public List<Message> getMessages() {
		return messages;
	}
}
