package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper;

import java.util.Map;

public interface NotificationSettingsMapper {

	int clearDeviceTokens(Map<String, Object> parameters);

}
