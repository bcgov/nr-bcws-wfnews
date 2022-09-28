package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfnews.persistence.v1.dto.ExternalUriDto;

public interface ExternalUriMapper {
	
	int insert(Map<String, Object> parameters);
	
	int update(Map<String, Object> parameters);
	
	ExternalUriDto fetch(Map<String, Object> parameters);
	
	List<ExternalUriDto> fetchAll();
	
	List<ExternalUriDto> select(Map<String, Object> parameters);
	
	List<ExternalUriDto> selectForIncident(Map<String, Object> parameters);
	
	int delete(Map<String, Object> parameters);
	
	int selectCount(Map<String, Object> parameters);
}