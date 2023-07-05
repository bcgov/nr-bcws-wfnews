package ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationDto;

public interface NotificationMapper {
	
	NotificationDto fetch(Map<String, Object> parameters);

	int insert(Map<String, Object> parameters);

	int update(Map<String, Object> parameters);

	int delete(Map<String, Object> parameters);

	List<NotificationDto> select(Map<String, Object> parameters);

}
