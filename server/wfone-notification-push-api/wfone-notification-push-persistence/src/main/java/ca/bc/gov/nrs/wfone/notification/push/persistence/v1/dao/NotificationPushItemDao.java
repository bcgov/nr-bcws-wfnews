package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao;

import java.util.Date;
import java.util.List;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationPushItemDto;

public interface NotificationPushItemDao {

	List<NotificationPushItemDto> select(
			String notificationGuids,
			String[] itemIdentifiers,
			Date afterItemPushTimestamp,
			Date beforeItemExpiryTimeStamp,
			String[] orderBy)
			throws DaoException;
	
	int selectCount(
			String notificationGuids,
			String[] itemIdentifiers,
			Date afterItemPushTimestamp,
			Date beforeItemExpiryTimeStamp
			) throws DaoException;


	void insert(NotificationPushItemDto dto, String userId) throws DaoException;

	NotificationPushItemDto fetch(String notificationPushItemGuid) throws DaoException;

	void update(String notificationPushItemGuid, NotificationPushItemDto dto, String userId)
			throws DaoException, NotFoundDaoException;

	void delete(String notificationPushItemGuid, String userId) throws DaoException;


}