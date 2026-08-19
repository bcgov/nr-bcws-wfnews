package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;

public interface NotificationPushItemMapper {

	int materialiseAudience(Map<String, Object> parameters);

	List<NotificationDto> claimPushItems(Map<String, Object> parameters);

	int releasePushItems(Map<String, Object> parameters);

	int deleteExpired(Map<String, Object> parameters);

}
