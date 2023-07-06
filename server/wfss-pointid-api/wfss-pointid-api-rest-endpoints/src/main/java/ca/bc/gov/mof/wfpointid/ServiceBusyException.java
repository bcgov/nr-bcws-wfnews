package ca.bc.gov.mof.wfpointid;

import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings("serial")
@ResponseStatus(value = org.springframework.http.HttpStatus.TOO_MANY_REQUESTS)
public class ServiceBusyException extends Exception {
	
	public ServiceBusyException(String service, Throwable ex) {
		super(Messages.ERROR_SERVICE_BUSY+ String.format(" (%s)", service), ex);
	}
}
