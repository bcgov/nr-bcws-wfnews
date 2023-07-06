package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationPushItemDto;

public interface NotificationPushItemMapper {
	NotificationPushItemDto fetch(Map<String, Object> parameters);

	int selectCount(Map<String, Object> parameters);

	List<NotificationPushItemDto> select(Map<String, Object> parameters);

	int insert(Map<String, Object> parameters);

	int update(Map<String, Object> parameters);

	int delete(Map<String, Object> parameters);
}
