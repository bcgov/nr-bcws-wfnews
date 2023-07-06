package ca.bc.gov.mof.wfpointid.rest.client;

import ca.bc.gov.mof.wfpointid.rest.resource.Messages;

public class BadRequestException extends ClientErrorException {

	private static final long serialVersionUID = 1L;
	
	private Messages messages;
	
	public BadRequestException(Messages messages) {
		super(400, messages!=null&&messages.hasErrors()?messages.getErrors().get(0).getMessage():"Unkown cause for Bad Request.");
		this.messages = messages;
	}

	public Messages getMessages() {
		return messages;
	}

}
