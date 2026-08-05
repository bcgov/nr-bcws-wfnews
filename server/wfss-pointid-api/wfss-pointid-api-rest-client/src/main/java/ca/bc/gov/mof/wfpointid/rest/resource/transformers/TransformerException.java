package ca.bc.gov.mof.wfpointid.rest.resource.transformers;

import java.io.Serial;

public class TransformerException extends Exception {

	@Serial
	private static final long serialVersionUID = 1L;

	public TransformerException() {}

	public TransformerException(String message) {
		super(message);
	}

	public TransformerException(Throwable cause) {
		super(cause);
	}

	public TransformerException(String message, Throwable cause) {
		super(message, cause);
	}

}
