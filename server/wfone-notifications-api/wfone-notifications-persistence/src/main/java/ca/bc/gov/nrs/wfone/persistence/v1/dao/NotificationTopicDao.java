package ca.bc.gov.nrs.wfone.persistence.v1.dao;

import java.util.List;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationTopicDto;

public interface NotificationTopicDao {

	NotificationTopicDto fetch(String notificationTopicGuid) throws DaoException;

	void insert(String notificationGuid, NotificationTopicDto dto, String userId) throws DaoException;

	void update(String notificationTopicGuid, NotificationTopicDto dto, String userId)
			throws DaoException, NotFoundDaoException;

	void delete(String notificationTopicGuid, NotificationTopicDto dto, String userId) throws DaoException;

	List<NotificationTopicDto> select(String notificationGuid) throws DaoException;

}