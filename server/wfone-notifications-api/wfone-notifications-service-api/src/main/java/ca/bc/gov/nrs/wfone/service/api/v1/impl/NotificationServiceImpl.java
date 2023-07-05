package ca.bc.gov.nrs.wfone.service.api.v1.impl;

import java.time.LocalDate;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.nrs.wfone.api.model.v1.Notification;
import ca.bc.gov.nrs.wfone.api.model.v1.NotificationSettings;
import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfone.common.persistence.dao.OptimisticLockingFailureDaoException;
import ca.bc.gov.nrs.wfone.common.service.api.ConflictException;
import ca.bc.gov.nrs.wfone.common.service.api.ForbiddenException;
import ca.bc.gov.nrs.wfone.common.service.api.NotFoundException;
import ca.bc.gov.nrs.wfone.common.service.api.ServiceException;
import ca.bc.gov.nrs.wfone.common.service.api.ValidationFailureException;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.NotificationDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.NotificationSettingsDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dao.NotificationTopicDao;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationDto;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationSettingsDto;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationTopicDto;
import ca.bc.gov.nrs.wfone.service.api.v1.NotificationService;
import ca.bc.gov.nrs.wfone.service.api.v1.model.factory.NotificationSettingsFactory;
import ca.bc.gov.nrs.wfone.service.api.v1.validation.ModelValidator;

public class NotificationServiceImpl implements NotificationService {
	
	private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);
	
	private Properties applicationProperties;
	
	private ModelValidator modelValidator;
	
	private NotificationDao notificationDao;
	private NotificationTopicDao notificationTopicDao;
	
	private NotificationSettingsDao notificationSettingsDao;
	private NotificationSettingsFactory notificationSettingsFactory;

	@Override
	public NotificationSettings<? extends Notification> getNotificationSettings(
			String subscriberGuid, 
			FactoryContext factoryContext)
			throws ServiceException, NotFoundException {
		
		logger.debug("<getNotificationSettings");

		NotificationSettings<? extends Notification>  result = null;

		try {
			
			if (subscriberGuid==null || subscriberGuid.equals("") ||  subscriberGuid.equalsIgnoreCase("null")) {

				throw new NotFoundException("Could not create/find  the NotificationSettings for empty or null subscriberGuid : "+subscriberGuid );
			}
			
			NotificationSettingsDto dto = this.notificationSettingsDao.fetch(subscriberGuid);

			if (dto == null) {

				dto = new NotificationSettingsDto();
				dto.setSubscriberGuid(subscriberGuid);
			}
			
			result = this.notificationSettingsFactory.getNotificationSettings(
					dto, 
					factoryContext);

		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}

		logger.debug(">getNotificationSettingsResource " + result);
		return result;
	}
	
	@Override
	public NotificationSettings<? extends Notification> updateNotificationSettings(
							String subscriberGuid,
							String optimisticLock,
							NotificationSettings<? extends Notification> notificationSettings,
							FactoryContext factoryContext)
			throws ServiceException, NotFoundException, ForbiddenException, ConflictException,	ValidationFailureException {
		logger.debug("<updateNotificationSettings");

		NotificationSettings<? extends Notification> result = null;

		try {
			
			// We don't have an explicit create method and the UI does not wait for a response before sending more requests so we need to do some locking		
			NotificationSettingsDto dto = this.notificationSettingsDao.fetch(subscriberGuid);
			
			if(dto==null) {
				// If the dto is null then we will have to create it.
				
				// Lock the table to make sure only one request is trying to create the record
				this.notificationSettingsDao.lock();
				
				// Fetch the dto again to make sure the record wasn't created while we were waiting for the lock
				dto = this.notificationSettingsDao.fetch(subscriberGuid);
			}
			
			if(dto==null) {
				
				dto =  new NotificationSettingsDto();
			}
			
			LocalDate effectiveAsOfDate = LocalDate.now();
			
			List<Message> errors = this.modelValidator.validateUpdateNotificationSettings(notificationSettings, effectiveAsOfDate);
			
			this.notificationSettingsFactory.applyModel(notificationSettings, dto );
			
			if (!errors.isEmpty()) {
				throw new ValidationFailureException(errors);
			}
			
			if(dto.getSubscriberGuid()==null) {
				
				this.notificationSettingsDao.insert(subscriberGuid, dto, null);
			} else {
				
				this.notificationSettingsDao.update(subscriberGuid, dto, null);
			}

			saveNotificationDtos(subscriberGuid, dto.getNotifications());
			
			NotificationSettingsDto updatedNotificationSettingsDto  = this.notificationSettingsDao.fetch(subscriberGuid);

			result = this.notificationSettingsFactory.getNotificationSettings(	updatedNotificationSettingsDto,	factoryContext);

		} catch (OptimisticLockingFailureDaoException e) {
			throw new ConflictException(e.getMessage());
		} catch (NotFoundDaoException e) {
			throw new NotFoundException(e.getMessage());
		} catch (DaoException e) {
			throw new ServiceException("DAO threw an exception", e);
		}

		logger.debug(">updateNotificationSettings " + result);
		return result;
	}
	
	private void saveNotificationDtos(String subscriberGuid, List<NotificationDto> dtos) throws DaoException {
		logger.debug("<saveNotificationDtos");
		
		List<NotificationDto> currentDtos = this.notificationDao.select(subscriberGuid);
		
		for(NotificationDto dto:dtos) {
			
			boolean found = false;
			for(Iterator<NotificationDto> iter = currentDtos.iterator();iter.hasNext();) {
				
				NotificationDto tmp = iter.next();
				
				if(tmp.equalsBK(dto)) {
					
					applyDto(dto, tmp);
					
					this.notificationDao.update(tmp.getNotificationGuid(), tmp, null);
					
					saveNotificationTopics(tmp.getNotificationGuid(), dto.getTopics());
					
					iter.remove();
					found = true;
				}
			}
			if(!found) {
				
				this.notificationDao.insert(subscriberGuid, dto, null);
				
				insertNotificationTopics(dto.getNotificationGuid(), dto.getTopics());
			}
		}
		for(NotificationDto dto:currentDtos) {
			
			deleteNotificationTopics(dto.getNotificationGuid());
			
			this.notificationDao.delete(dto.getNotificationGuid(), dto, null);
		}
		
		logger.debug(">saveNotificationDtos");
	}

	private void deleteNotificationTopics(String notificationGuid) throws DaoException {
		logger.debug("<deleteNotificationTopics");
		
		List<NotificationTopicDto> currentDtos = this.notificationTopicDao.select(notificationGuid);
		
		for(NotificationTopicDto dto:currentDtos) {
			
			this.notificationTopicDao.delete(dto.getNotificationTopicGuid(), dto, null);
		}
		
		logger.debug(">deleteNotificationTopics");
	}

	private void insertNotificationTopics(String notificationGuid, List<NotificationTopicDto> dtos) throws DaoException {
		logger.debug("<insertNotificationTopics");
		
		for(NotificationTopicDto dto:dtos) {
				
			this.notificationTopicDao.insert(notificationGuid, dto, null);
		}
		
		logger.debug(">insertNotificationTopics");
	}

	private void saveNotificationTopics(String notificationGuid, List<NotificationTopicDto> dtos) throws DaoException {
		logger.debug("<saveNotificationTopics");
		
		List<NotificationTopicDto> currentDtos = this.notificationTopicDao.select(notificationGuid);
		
		for(NotificationTopicDto dto:dtos) {
			
			boolean found = false;
			for(Iterator<NotificationTopicDto> iter = currentDtos.iterator();iter.hasNext();) {
				
				NotificationTopicDto tmp = iter.next();
				
				if(tmp.equalsBK(dto)) {
					
					applyDto(dto, tmp);
					
					this.notificationTopicDao.update(tmp.getNotificationGuid(), tmp, null);
					
					iter.remove();
					found = true;
				}
			}
			if(!found) {
				
				this.notificationTopicDao.insert(notificationGuid, dto, null);
			}
		}
		for(NotificationTopicDto dto:currentDtos) {
			
			this.notificationTopicDao.delete(dto.getNotificationTopicGuid(), dto, null);
		}
		
		logger.debug(">saveNotificationTopics");
	}

	private static void applyDto(NotificationTopicDto newDto, NotificationTopicDto oldDto) {
		
		newDto.setNotificationTopicName(oldDto.getNotificationTopicName());
	}

	private static void applyDto(NotificationDto newDto, NotificationDto oldDto) {
		
		oldDto.setNotificationName(newDto.getNotificationName());
		oldDto.setNotificationType(newDto.getNotificationType());
		oldDto.setRadius(newDto.getRadius());
		oldDto.setLatitude(newDto.getLatitude());
		oldDto.setLongitude(newDto.getLongitude());
		oldDto.setActiveIndicator(newDto.getActiveIndicator());
	}
	
	public NotificationSettingsDao getNotificationSettingsDao() {
		return notificationSettingsDao;
	}
	
	public void setNotificationSettingsDao(NotificationSettingsDao notificationSettingsDao) {
		this.notificationSettingsDao = notificationSettingsDao;
	}
	
	public NotificationSettingsFactory getNotificationSettingsFactory() {
		return notificationSettingsFactory;
	}
	
	public void setNotificationSettingsFactory(NotificationSettingsFactory notificationSettingsFactory) {
		this.notificationSettingsFactory = notificationSettingsFactory;
	}
	
	public NotificationDao getNotificationDao() {
		return notificationDao;
	}
		
	public void setNotificationDao(NotificationDao notificationDao) {
		this.notificationDao = notificationDao;
	}
	
	public void setNotificationTopicDao(NotificationTopicDao notificationTopicDao) {
		this.notificationTopicDao = notificationTopicDao;
	}

	public void setModelValidator(ModelValidator modelValidator) {
		this.modelValidator = modelValidator;
	}

	public void setApplicationProperties(Properties applicationProperties) {
		this.applicationProperties = applicationProperties;
	}

	public Properties getApplicationProperties() {
		return applicationProperties;
	}

}