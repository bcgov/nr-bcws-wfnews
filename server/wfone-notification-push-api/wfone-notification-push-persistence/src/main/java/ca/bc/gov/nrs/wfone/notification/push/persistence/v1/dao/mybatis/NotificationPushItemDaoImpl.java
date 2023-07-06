package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.mybatis.BaseDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.NotificationPushItemDao;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper.NotificationPushItemMapper;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationPushItemDto;

public class NotificationPushItemDaoImpl extends BaseDao implements NotificationPushItemDao{
	
	private static final Logger logger = LoggerFactory.getLogger(NotificationPushItemDaoImpl.class);
	
	@Autowired
	private NotificationPushItemMapper mapper;
	
	@Override
	public int selectCount(
			String notificationGuid,
			String[] itemIdentifiers,
			Date afterItemPushTimestamp,
			Date afterItemExpiryTimeStamp
			) throws DaoException{

		logger.debug("<selectCount");
		
		int result = 0;

		try {
			
			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("notificationGuid", notificationGuid);
			parameters.put("itemIdentifiers", itemIdentifiers);
			parameters.put("afterItemPushTimestamp", afterItemPushTimestamp);
			parameters.put("afterItemExpiryTimeStamp", afterItemExpiryTimeStamp);
			
			result = this.mapper.selectCount(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">selectCount " + result);
		return result;
	}
	
	
	@Override
	public List<NotificationPushItemDto> select(
			String notificationGuid,
			String[] itemIdentifiers,
			Date afterItemPushTimestamp,
			Date afterItemExpiryTimeStamp,
			String[] orderBy
			) throws DaoException {

		logger.debug("<select");

		List<NotificationPushItemDto> results = null;

		try {
			
			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("notificationGuid", notificationGuid);
			parameters.put("itemIdentifiers", itemIdentifiers );
			parameters.put("afterItemPushTimestamp", afterItemPushTimestamp );
			parameters.put("afterItemExpiryTimeStamp", afterItemExpiryTimeStamp );
			parameters.put("orderBys", orderBy);
			
			results = this.mapper.select(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">select " + results);
		return results;
	}
	
	
	@Override
	public void insert(NotificationPushItemDto dto, String userId) throws DaoException {
		logger.debug("<insert");


		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("dto", dto);
			parameters.put("userId", userId);
			int count = this.mapper.insert(parameters);

			if(count==0) {
				throw new DaoException("Record not inserted: "+count);
			}
			
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">insert ");
	}
	
	
	@Override
	public NotificationPushItemDto fetch(String notificationPushItemGuid) throws DaoException  {
		
		logger.debug("<fetch");

		NotificationPushItemDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("notificationPushItemGuid", notificationPushItemGuid );
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
	public void update(String notificationPushItemGuid, NotificationPushItemDto dto, String userId) 
			throws DaoException, NotFoundDaoException {
		logger.debug("<update");
		
		if(dto.isDirty()) {
	
			try {
	
				Map<String, Object> parameters = new HashMap<String, Object>();
				parameters.put("notificationPushItemGuid",  notificationPushItemGuid);
				parameters.put("dto", dto);
				parameters.put("userId", userId);
				
				int count = this.mapper.update(parameters);
				
				if(count==0) {
					throw new DaoException("Record not updated: "+count);
				}	
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
	public void delete(String notificationPushItemGuid, String userId) 	throws DaoException {
		logger.debug("<delete");

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("notificationPushItemGuid",  notificationPushItemGuid);
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
