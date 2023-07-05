package ca.bc.gov.nrs.wfone.persistence.v1.dao;

import java.util.List;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationDto;

public interface NotificationDao {

	NotificationDto fetch(String notificationGuid) throws DaoException;

	void insert(String subscriberGuid, NotificationDto dto, String userId) throws DaoException;

	void update(String notificationGuid, NotificationDto dto, String userId) throws DaoException, NotFoundDaoException;

	void delete(String notificationGuid, NotificationDto dto, String userId) throws DaoException;

	List<NotificationDto> select(String subscriberGuid) throws DaoException;

}