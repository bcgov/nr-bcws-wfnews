package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfnews.persistence.v1.dto.AttachmentDto;

public interface AttachmentMapper {
  int insert(Map<String, Object> parameters);
	int update(Map<String, Object> parameters);
	AttachmentDto fetch(Map<String, Object> parameters);
	List<AttachmentDto> select(Map<String, Object> parameters);
	int delete(Map<String, Object> parameters);
	int selectCount(Map<String, Object> parameters);
}
