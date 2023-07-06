package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.validation;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.persistence.code.dto.CodeDto;
import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.service.api.validation.BaseValidator;
import ca.bc.gov.nrs.wfone.common.utils.MessageBuilder;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.util.CachedCodeTables;

public class ModelValidator extends BaseValidator {

	private static final Logger logger = LoggerFactory.getLogger(ModelValidator.class);

	private CachedCodeTables cachedCodeTables;

	public ModelValidator() {
		logger.debug("<ModelValidator");

		logger.debug(">ModelValidator");
	}

	public List<Message> validateCode(String codeTableName, String value, LocalDate effectiveAsOfDate,
			String propertyName, String message) throws DaoException {

		List<Message> results = new ArrayList<>();

		if (value != null && value.trim().length() > 0) {

			CodeDto codeDto = this.cachedCodeTables.get(codeTableName, value, effectiveAsOfDate);

			if (codeDto == null) {

				MessageBuilder messageBuilder = new MessageBuilder(propertyName, message, message);

				messageBuilder.addArg("value", value);

				results.add(messageBuilder.getMessage());
			}
		}

		return results;
	}

	protected static List<Message> addParentPath(List<Message> messages, String parentPath) {

		for (Message message : messages) {

			addParentPath(message, parentPath);
		}

		return messages;
	}

	public static Message addParentPath(Message message, String parentPath) {

		String path = message.getPath();
		path = (path == null) ? "" : path;
		path = parentPath + "." + path;
		message.setPath(path);

		return message;
	}

	public void setCachedCodeTables(CachedCodeTables cachedCodeTables) {
		this.cachedCodeTables = cachedCodeTables;
	}
}
