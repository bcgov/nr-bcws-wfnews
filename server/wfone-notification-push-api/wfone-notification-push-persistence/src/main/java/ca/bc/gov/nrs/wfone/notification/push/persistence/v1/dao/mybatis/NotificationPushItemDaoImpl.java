package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BaseDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationPushItemDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper.NotificationPushItemMapper;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationPushItemDto;

public class NotificationPushItemDaoImpl extends BaseDao implements NotificationPushItemDao{

	private static final Logger logger = LoggerFactory.getLogger(NotificationPushItemDaoImpl.class);

	@Autowired
	private NotificationPushItemMapper mapper;

	@Override
	public List<String> insertPushItems(List<NotificationPushItemDto> dtos, String userId) throws DaoException {
		logger.debug("<insertPushItems");

		List<String> result = new ArrayList<>();

		if (dtos == null || dtos.isEmpty()) {
			logger.debug(">insertPushItems 0");
			return result;
		}

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("items", dtos);
			parameters.put("userId", userId);

			result = this.mapper.insertPushItems(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">insertPushItems " + result.size());
		return result;
	}

	@Override
	public int deletePushItems(List<String> notificationGuids, String itemIdentifier) throws DaoException {
		logger.debug("<deletePushItems");

		int result = 0;

		if (notificationGuids == null || notificationGuids.isEmpty()) {
			logger.debug(">deletePushItems 0");
			return result;
		}

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("notificationGuids", notificationGuids);
			parameters.put("itemIdentifier", itemIdentifier);

			result = this.mapper.deletePushItems(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">deletePushItems " + result);
		return result;
	}

	@Override
	public int deleteExpired(int limit) throws DaoException {
		logger.debug("<deleteExpired");

		int result = 0;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("limit", limit);

			result = this.mapper.deleteExpired(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">deleteExpired " + result);
		return result;
	}

}
