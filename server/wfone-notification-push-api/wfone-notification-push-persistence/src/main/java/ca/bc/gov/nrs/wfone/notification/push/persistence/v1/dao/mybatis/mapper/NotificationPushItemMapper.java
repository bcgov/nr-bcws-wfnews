package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

public interface NotificationPushItemMapper {

	List<String> insertPushItems(Map<String, Object> parameters);

	int deletePushItems(Map<String, Object> parameters);

}
