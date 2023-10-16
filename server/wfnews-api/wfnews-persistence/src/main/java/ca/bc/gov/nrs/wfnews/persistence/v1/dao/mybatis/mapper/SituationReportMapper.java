package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfnews.persistence.v1.dto.SituationReportDto;

public interface SituationReportMapper {
  int insert(Map<String, Object> parameters);
	int update(Map<String, Object> parameters);
	int delete(Map<String, Object> parameters);
	SituationReportDto fetch(Map<String, Object> parameters);
	List<SituationReportDto> select(Map<String, Object> parameters);
	int selectCount(Map<String, Object> parameters);
}
