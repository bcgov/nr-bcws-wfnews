package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao;

import java.util.List;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;

public interface NotificationSettingsDao {

	/**
	 * Blanks the device tokens of the dead tokens in one FCM batch, in one statement. There
	 * is no active flag on notification_settings: a blank token is how a device drops out.
	 */
	int clearDeviceTokens(List<String> subscriberGuids, String userId) throws DaoException;

}