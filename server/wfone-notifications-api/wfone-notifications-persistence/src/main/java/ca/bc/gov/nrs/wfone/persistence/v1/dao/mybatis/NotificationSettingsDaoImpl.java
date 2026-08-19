package ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BaseDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper.NotificationSettingsMapper;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationSettingsDto;

public class NotificationSettingsDaoImpl extends BaseDao implements NotificationSettingsDao {
	
	private static final Logger logger = LoggerFactory.getLogger(NotificationSettingsDaoImpl.class);
	
	@Autowired
	private NotificationSettingsMapper mapper;
	
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
	public void upsert(String subscriberGuid, NotificationSettingsDto dto, String userId) throws DaoException {
		logger.debug("<upsert");

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("subscriberGuid", subscriberGuid);
			parameters.put("dto", dto);
			parameters.put("userId", userId);
			int count = this.mapper.upsert(parameters);

			if(count==0) {
				throw new DaoException("Record not written: "+count);
			}

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">upsert ");
	}
	
}
