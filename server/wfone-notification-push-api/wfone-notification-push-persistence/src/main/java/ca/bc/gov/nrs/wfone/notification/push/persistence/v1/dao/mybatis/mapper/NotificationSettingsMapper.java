package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationSettingsDto;



public interface NotificationSettingsMapper {

	NotificationSettingsDto fetch(Map<String, Object> parameters);

	int selectCount(Map<String, Object> parameters);

	List<NotificationSettingsDto> select(Map<String, Object> parameters);

	int inactivate(Map<String, Object> parameters);

}
