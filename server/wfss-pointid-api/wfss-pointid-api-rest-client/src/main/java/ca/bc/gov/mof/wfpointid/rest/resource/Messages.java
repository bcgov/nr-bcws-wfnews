package ca.bc.gov.mof.wfpointid.rest.resource;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import ca.bc.gov.mof.wfpointid.model.Message;

public class Messages implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private List<Message> errors;

	public Messages() {
		this.errors = new ArrayList<Message>();
	}

	public Messages(String message) {
		this.errors = new ArrayList<Message>();
		this.errors.add(new Message(message));
	}

	public Messages(List<Message> errors) {
		this.errors = errors;
	}

	public boolean hasErrors() {
		return !errors.isEmpty();
	}

	public List<Message> getErrors() {
		return errors;
	}
}