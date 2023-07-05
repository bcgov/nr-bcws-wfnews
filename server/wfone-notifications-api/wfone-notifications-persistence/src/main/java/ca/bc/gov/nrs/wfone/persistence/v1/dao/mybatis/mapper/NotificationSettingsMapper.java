package ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper;

import java.util.Map;

import ca.bc.gov.nrs.wfone.persistence.v1.dto.NotificationSettingsDto;

public interface NotificationSettingsMapper {

	void lock(Map<String, Object> parameters);

	NotificationSettingsDto fetch(Map<String, Object> parameters);

	int selectCount(Map<String, Object> parameters);

	int insert(Map<String, Object> parameters);

	int update(Map<String, Object> parameters);

}
