package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PublishedIncidentDto;

public interface PublishedIncidentMapper {
	
	int insert(Map<String, Object> parameters);
	
	int update(Map<String, Object> parameters);
	
	PublishedIncidentDto fetch(Map<String, Object> parameters);
	
	PublishedIncidentDto fetchForIncidentGuid(Map<String, Object> parameters);
	
	List<PublishedIncidentDto> select(Map<String, Object> parameters);
	
	int delete(Map<String, Object> parameters);
	
	int selectCount(Map<String, Object> parameters);

	String selectAsJson(Map<String, Object> parameters);

	String selectFireOfNoteAsJson(Map<String, Object> parameters);
}