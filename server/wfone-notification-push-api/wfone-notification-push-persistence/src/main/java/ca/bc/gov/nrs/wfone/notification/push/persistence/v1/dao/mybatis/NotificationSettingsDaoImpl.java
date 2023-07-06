package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BaseDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper.NotificationSettingsMapper;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationSettingsDto;

public class NotificationSettingsDaoImpl extends BaseDao implements NotificationSettingsDao {
	
	private static final Logger logger = LoggerFactory.getLogger(NotificationSettingsDaoImpl.class);
	
	@Autowired
	private NotificationSettingsMapper mapper;

	@Override
	public List<NotificationSettingsDto> select(
			String[] notificationTypes,
			Boolean activeIndicator,
			String[] orderBy
			) throws DaoException {

		logger.debug("<select");

		List<NotificationSettingsDto> results = null;

		try {
			
			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("notificationTypes", notificationTypes );
			parameters.put("activeIndicator", activeIndicator );
			parameters.put("orderBys", orderBy);
			
			results = this.mapper.select(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">select " + results);
		return results;
	}
	
 
	
	@Override
	public NotificationSettingsDto fetch(String subscriberGuid) throws DaoException  {
		
		logger.debug("<fetch");

		NotificationSettingsDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("subscriberGuid", subscriberGuid );
			result = this.mapper.fetch(parameters);
			
			if(result!=null) {

				result.resetDirty();
			}

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">fetch " + result);
		return result;
		
	}

	@Override
	public void inactivate(String subscriberGuid, String userId) 
			throws DaoException, NotFoundDaoException {
		logger.debug("<inactivate");
	
		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("subscriberGuid",  subscriberGuid);
			parameters.put("userId", userId);
			
			int count = this.mapper.inactivate(parameters);
			
			if(count==0) {
				throw new DaoException("Record not updated: "+count);
			}	

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">inactivate");
	}

	
}
