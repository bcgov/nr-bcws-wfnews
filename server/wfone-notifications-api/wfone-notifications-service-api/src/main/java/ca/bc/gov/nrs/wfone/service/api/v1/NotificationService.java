package ca.bc.gov.nrs.wfone.service.api.v1;

import org.springframework.transaction.annotation.Transactional;

import ca.bc.gov.nrs.wfone.api.model.v1.Notification;
import ca.bc.gov.nrs.wfone.api.model.v1.NotificationSettings;
import ca.bc.gov.nrs.wfone.common.service.api.ConflictException;
import ca.bc.gov.nrs.wfone.common.service.api.ForbiddenException;
import ca.bc.gov.nrs.wfone.common.service.api.NotFoundException;
import ca.bc.gov.nrs.wfone.common.service.api.ServiceException;
import ca.bc.gov.nrs.wfone.common.service.api.ValidationFailureException;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;

public interface NotificationService {
	
	@Transactional(readOnly = true, rollbackFor = Exception.class, transactionManager = "transactionManager")
	public NotificationSettings<? extends Notification> getNotificationSettings(String subscriberGuid, FactoryContext factoryContext)
			throws ServiceException, NotFoundException;

	@Transactional(readOnly = false, rollbackFor = Exception.class, transactionManager = "transactionManager")
	public NotificationSettings<? extends Notification> updateNotificationSettings(String subscriberGuid, String optimisticLock,
			NotificationSettings<? extends Notification> totificationSettings, FactoryContext factoryContext)
			throws ServiceException, NotFoundException, ForbiddenException, ConflictException,	ValidationFailureException;
}
