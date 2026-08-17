package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BaseDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper.NotificationSettingsMapper;

public class NotificationSettingsDaoImpl extends BaseDao implements NotificationSettingsDao {

	private static final Logger logger = LoggerFactory.getLogger(NotificationSettingsDaoImpl.class);

	@Autowired
	private NotificationSettingsMapper mapper;

	// FKA inactivate
	@Override
	public int clearDeviceTokens(List<String> subscriberGuids, String userId) throws DaoException {
		logger.debug("<clearDeviceTokens");

		int result = 0;

		if (subscriberGuids == null || subscriberGuids.isEmpty()) {
			logger.debug(">clearDeviceTokens 0");
			return result;
		}

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("subscriberGuids", subscriberGuids);
			parameters.put("userId", userId);

			result = this.mapper.clearDeviceTokens(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">clearDeviceTokens " + result);
		return result;
	}

}
