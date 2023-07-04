package ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BaseDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.NotificationDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper.NotificationMapper;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationDto;

@Repository
public class NotificationDaoImpl extends BaseDao implements NotificationDao {
	
	private static final Logger logger = LoggerFactory.getLogger(NotificationDaoImpl.class);

	@Autowired
	private NotificationMapper mapper;

	
	
	@Override
	public NotificationDto fetch(String notificationGuid) throws DaoException {
		logger.debug("<fetch");

		NotificationDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("notificationGuid", notificationGuid);
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
	public List<NotificationDto> select(String subscriberGuid) throws DaoException {
		logger.debug("<select");

		List<NotificationDto> result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("subscriberGuid", subscriberGuid);
			result = this.mapper.select(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">select " + result);
		return result;
	}
	
	@Override
	public void insert(String subscriberGuid, NotificationDto dto, String userId) throws DaoException {
		logger.debug("<insert");

		String notificationGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("subscriberGuid", subscriberGuid);
			parameters.put("dto", dto);
			parameters.put("userId", userId);
			int count = this.mapper.insert(parameters);

			if(count==0) {
				throw new DaoException("Record not inserted: "+count);
			}
			
			notificationGuid = (String) parameters.get("notificationGuid");
			
			dto.setNotificationGuid(notificationGuid);
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">insert " + notificationGuid);
	}

	
	
	@Override
	public void update(String notificationGuid, NotificationDto dto, String userId) 
			throws DaoException, NotFoundDaoException {
		logger.debug("<update");
		
		if(dto.isDirty()) {
	
			try {
	
				Map<String, Object> parameters = new HashMap<String, Object>();
				parameters.put("notificationGuid", notificationGuid);
				parameters.put("dto", dto);
				parameters.put("userId", userId);
				int count = this.mapper.update(parameters);
	
				if(count==0) {
					throw new DaoException("Record not updated: "+count);
				}
	
			} catch (RuntimeException e) {
				handleException(e);
			}
		} else {
			
			logger.info("Skipping update because dto is not dirty");
		}

		logger.debug(">update");
	}

	
	
	@Override
	public void delete(String notificationGuid, NotificationDto dto, String userId) 	throws DaoException {
		logger.debug("<delete");

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("notificationGuid", notificationGuid);
			parameters.put("userId", userId);
			int count = this.mapper.delete(parameters);

			if(count==0) {
				throw new DaoException("Record not deleted: "+count);
			}

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">delete");
	}
}
	


