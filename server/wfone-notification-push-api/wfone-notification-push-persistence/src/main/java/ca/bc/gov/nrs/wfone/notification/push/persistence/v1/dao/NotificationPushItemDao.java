package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao;

import java.util.List;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationPushItemDto;

public interface NotificationPushItemDao {

	/**
	 * Inserts a push item for a whole page in one statement. A recipient that already has a
	 * push item for this event conflicts and is skipped, so the guids returned are the ones
	 * to send to.
	 */
	List<String> insertPushItems(List<NotificationPushItemDto> dtos, String userId) throws DaoException;

	/** Removes push items that could not be sent, so a later delivery can try them again. */
	int deletePushItems(List<String> notificationGuids, String itemIdentifier) throws DaoException;

	/** Deletes at most limit expired rows. Returns the count, so the caller can loop. */
	int deleteExpired(int limit) throws DaoException;

}