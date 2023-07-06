package ca.bc.gov.nrs.wfone.persistence.v1.dao;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationSettingsDto;

public interface NotificationSettingsDao {

	void lock() throws DaoException;

	NotificationSettingsDto fetch(String subscriberGuid) throws DaoException;

	void insert(String subscriberGuid, NotificationSettingsDto dto, String userId) throws DaoException;

	void update(String subscriberGuid, NotificationSettingsDto dto, String userId)	throws DaoException;

}