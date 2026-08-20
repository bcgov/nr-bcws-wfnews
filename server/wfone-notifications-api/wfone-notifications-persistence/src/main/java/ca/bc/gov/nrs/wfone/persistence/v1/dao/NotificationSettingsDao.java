package ca.bc.gov.nrs.wfone.persistence.v1.dao;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationSettingsDto;

public interface NotificationSettingsDao {

	NotificationSettingsDto fetch(String subscriberGuid) throws DaoException;

	/** Insert or update. The primary key settles a concurrent create. */
	void upsert(String subscriberGuid, NotificationSettingsDto dto, String userId) throws DaoException;

}
