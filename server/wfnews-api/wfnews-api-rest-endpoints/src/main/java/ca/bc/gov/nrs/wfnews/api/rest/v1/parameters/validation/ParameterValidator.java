package ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation;

import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.service.api.validation.BaseValidator;
import ca.bc.gov.nrs.wfone.common.utils.DateUtils;
import ca.bc.gov.nrs.wfone.common.utils.MessageBuilder;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.PagingQueryParameters;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation.constraints.EffectiveAsOfDateQueryParametersConstraints;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation.constraints.EffectiveAsOfTimestampQueryParametersConstraints;
import ca.bc.gov.nrs.wfnews.api.rest.v1.parameters.validation.constraints.PagingQueryParameterConstraints;

public class ParameterValidator extends BaseValidator {
	private static final Logger logger = LoggerFactory.getLogger(ParameterValidator.class);
	
	public List<Message> validatePagingQueryParameters(PagingQueryParameters parameters) {
		logger.debug("<validatePagingQueryParameters");
		
		List<Message> results = this.validate(parameters, PagingQueryParameterConstraints.class);

		logger.debug(">validatePagingQueryParameters " + results);
		return results;
	}

	public List<Message> validateEffectiveAsOfDateQueryParameters(EffectiveAsOfDateQueryParametersConstraints parameters) {
		logger.debug("<validateEffectiveAsOfDateQueryParameters");
		
		List<Message> results = new ArrayList<>();
		
		String value = parameters.getEffectiveAsOfDate();
		try {
		
			DateUtils.toLocalDate(value);
		} catch(DateTimeParseException e) {
			
			MessageBuilder builder = new MessageBuilder(
					"effectiveAsOfDate", 
					Errors.INVALID_LOCAL_DATE_FORMAT, 
					"The effectiveAsOfDate parameter value '{0}' must use the format YYYY-MM-DD.");
			
			builder.addArg("value", value);
			
			results.add(builder.getMessage());
		}

		logger.debug(">validateEffectiveAsOfDateQueryParameters " + results);
		return results;
	}

	public List<Message> validateEffectiveAsOfTimestampQueryParameters(EffectiveAsOfTimestampQueryParametersConstraints parameters) {
		logger.debug("<validateEffectiveAsOfTimestampQueryParameters");
		
		List<Message> results = new ArrayList<>();
		
		String value = parameters.getEffectiveAsOfTimestamp();
		try {
		
			DateUtils.toInstant(value);
		} catch(DateTimeParseException e) {
			
			MessageBuilder builder = new MessageBuilder(
					"effectiveAsOfDate", 
					Errors.INVALID_TIMESTAMP_FORMAT, 
					"The effectiveAsOfTimestamp parameter value '{0}' must use the format YYYY-MM-DDTHH:mm:ssZ.");
			
			builder.addArg("value", value);
			
			results.add(builder.getMessage());
		}

		logger.debug(">validateEffectiveAsOfTimestampQueryParameters " + results);
		return results;
	}
}