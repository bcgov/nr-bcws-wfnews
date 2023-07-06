package ca.bc.gov.mof.wfpointid.rest.validate;

import java.time.Duration;
import java.time.format.DateTimeParseException;

public class ParameterDuration {
	private String name;
	private String val;

	public ParameterDuration(String name, String value) {
		this.name = name;
		this.val = value;
	}
	
	public ParameterDuration checkValid() throws ParameterException {
		try {
			Duration.parse(val);
		} catch (DateTimeParseException ex) {
			throw new ParameterException(name, "invalid duration");
		}
		return this;
	}
	
	public ParameterDuration checkPositive() throws ParameterException {
		Duration d = Duration.parse(val);
		if (d.isNegative() || d.isZero()) {
			throw new ParameterException(name, "invalid duration: not positive");
		}
		return this;
	}
	
	public Duration get() {
		return Duration.parse(val);
	}
}
