package ca.bc.gov.nrs.wfone.service.api.v1.validation;

import java.text.ParseException;
import java.text.SimpleDateFormat;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DateValidator implements ConstraintValidator<Date, String> {
	private static final Logger logger = LoggerFactory.getLogger(DateValidator.class);
	
	private String mask;
	
	@Override
	public void initialize(Date constraintAnnotation) {
		this.mask = constraintAnnotation.mask();
	}

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		boolean valid = false;
		
		if (value == null || value.trim().isEmpty()) {
			valid = true;
			
		} else {
			if (isLong(value)) {
				try {
					Long.valueOf(value);
					valid = true;
					
				} catch(NumberFormatException nfe) {
					logger.debug(nfe.getMessage());
				}
				
			} else {
				//maybe it's a date mask
				SimpleDateFormat sdf = new SimpleDateFormat(mask);
				
				try {
					sdf.parse(value);
					valid = true;
					
				} catch (ParseException pe) {
					logger.debug(pe.getMessage());
				}
			}
		}
			
		return valid;
	}

	/**
	 * Determine if value is a number.
	 * @param value
	 * @return
	 */
	private static boolean isLong(String value) {
		
		boolean result = false;
		
		try {
			Long.parseLong(value);
			 result  = true;
		} catch(RuntimeException e) {
			//do nothing
		}
		
		return result;
	}
	
}
