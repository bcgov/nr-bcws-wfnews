package ca.bc.gov.nrs.wfone.service.api.v1.model.factory;

import ca.bc.gov.nrs.wfone.api.model.v1.Notification;
import ca.bc.gov.nrs.wfone.api.model.v1.NotificationSettings;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryException;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationSettingsDto;

public interface NotificationSettingsFactory {

	NotificationSettings<? extends Notification> getNotificationSettings(NotificationSettingsDto dto, FactoryContext context) throws FactoryException;


	void applyModel(NotificationSettings<? extends Notification> resource, NotificationSettingsDto dto);


}