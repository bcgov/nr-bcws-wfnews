package ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFImageDto;

public interface RoFImageMapper {
	int insert(Map<String, Object> parameters);
  List<RoFImageDto> select(Map<String, Object> parameters);
  int delete(Map<String, Object> parameters);
}
