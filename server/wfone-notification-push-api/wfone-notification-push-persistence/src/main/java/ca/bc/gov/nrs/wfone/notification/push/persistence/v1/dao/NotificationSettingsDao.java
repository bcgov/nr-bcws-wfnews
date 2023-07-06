package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao;

import java.util.List;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationSettingsDto;

public interface NotificationSettingsDao {

	NotificationSettingsDto fetch(String subscriberGuid) throws DaoException;

	List<NotificationSettingsDto> select(String[] notificationTypes, Boolean activeInd, String[] orderBy)	throws DaoException;

	void inactivate(String subscriberGuid, String userId)	throws DaoException;

}