package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.vividsolutions.jts.geom.Geometry;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BaseDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationPushItemDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper.NotificationPushItemMapper;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql.EventGeometry;

public class NotificationPushItemDaoImpl extends BaseDao implements NotificationPushItemDao{

	private static final Logger logger = LoggerFactory.getLogger(NotificationPushItemDaoImpl.class);

	@Autowired
	private NotificationPushItemMapper mapper;

	@Override
	public int materialiseAudience(Geometry eventGeometry, String topic, String itemIdentifier, Date pushTimestamp,
			Date itemExpiryTimestamp, String userId) throws DaoException {
		logger.debug("<materialiseAudience");

		int result = 0;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("topic", topic);
			parameters.put("itemIdentifier", itemIdentifier);
			parameters.put("pushTimestamp", pushTimestamp);
			parameters.put("itemExpiryTimestamp", itemExpiryTimestamp);
			parameters.put("userId", userId);
			EventGeometry.addTo(parameters, eventGeometry);

			result = this.mapper.materialiseAudience(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">materialiseAudience " + result);
		return result;
	}

	@Override
	public List<NotificationDto> claimPushItems(String itemIdentifier, String afterSubscriberGuid,
			String afterPushItemGuid, int pageSize) throws DaoException {
		logger.debug("<claimPushItems");

		List<NotificationDto> result = new ArrayList<>();

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("itemIdentifier", itemIdentifier);
			// An empty string is less than every guid, so it claims the first page.
			parameters.put("afterSubscriberGuid", afterSubscriberGuid == null ? "" : afterSubscriberGuid);
			parameters.put("afterPushItemGuid", afterPushItemGuid == null ? "" : afterPushItemGuid);
			parameters.put("pageSize", pageSize);

			result = this.mapper.claimPushItems(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">claimPushItems " + result.size());
		return result;
	}

	@Override
	public int releasePushItems(List<String> pushItemGuids, String itemIdentifier) throws DaoException {
		logger.debug("<releasePushItems");

		int result = 0;

		if (pushItemGuids == null || pushItemGuids.isEmpty()) {
			logger.debug(">releasePushItems 0");
			return result;
		}

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("pushItemGuids", pushItemGuids);
			parameters.put("itemIdentifier", itemIdentifier);

			result = this.mapper.releasePushItems(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">releasePushItems " + result);
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
