package ca.bc.gov.mof.wfpointid.rest.client;

import ca.bc.gov.mof.wfpointid.rest.resource.Messages;

public class ServerErrorException extends RestDAOException {

	private static final long serialVersionUID = 1L;
	
	private int code;
	
	private Messages messages;
	
	public ServerErrorException(int code, String message) {
		super(message);
		this.code = code;
		this.messages = new Messages(message);
	}
	
	public ServerErrorException(int code, Messages messages) {
		super(messages!=null&&messages.hasErrors()?messages.getErrors().get(0).getMessage():"Unkown cause for Server Error.");
		this.code = code;
		this.messages = messages;
	}

	public int getCode() {
		return code;
	}

	public Messages getMessages() {
		return messages;
	}

}
