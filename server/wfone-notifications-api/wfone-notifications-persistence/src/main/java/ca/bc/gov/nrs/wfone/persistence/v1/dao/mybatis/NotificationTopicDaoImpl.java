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
import ca.bc.gov.nrs.wfone.persistence.v1.dao.NotificationTopicDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper.NotificationTopicMapper;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationTopicDto;

@Repository
public class NotificationTopicDaoImpl extends BaseDao implements NotificationTopicDao {
	
	private static final Logger logger = LoggerFactory.getLogger(NotificationTopicDaoImpl.class);
	
	@Autowired
	private NotificationTopicMapper mapper;
	
	@Override
	public NotificationTopicDto fetch(String notificationTopicGuid) throws DaoException {
		logger.debug("<fetch");

		NotificationTopicDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("notificationTopicGuid", notificationTopicGuid);
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
	public List<NotificationTopicDto> select(String notificationGuid) throws DaoException {
		logger.debug("<select");

		List<NotificationTopicDto> result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("notificationGuid", notificationGuid);
			result = this.mapper.select(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">select " + result);
		return result;
	}

	@Override
	public void insert(String notificationGuid, NotificationTopicDto dto, String userId) throws DaoException {
		logger.debug("<insert");

		String notificationTopicGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("notificationGuid", notificationGuid);
			parameters.put("dto", dto);
			parameters.put("userId", userId);
			int count = this.mapper.insert(parameters);

			if(count==0) {
				throw new DaoException("Record not inserted: "+count);
			}
			
			notificationTopicGuid = (String) parameters.get("notificationTopicGuid");
			
			dto.setNotificationTopicGuid(notificationTopicGuid);
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">insert " + notificationTopicGuid);
	}

	
	
	@Override
	public void update(String notificationTopicGuid, NotificationTopicDto dto, String userId) 
			throws DaoException, NotFoundDaoException {
		logger.debug("<update");
		
		if(dto.isDirty()) {
	
			try {
	
				Map<String, Object> parameters = new HashMap<String, Object>();
				parameters.put("notificationTopicGuid", notificationTopicGuid);
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
	public void delete(String notificationTopicGuid, NotificationTopicDto dto, String userId) 	throws DaoException {
		logger.debug("<delete");

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("notificationTopicGuid", notificationTopicGuid);
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
