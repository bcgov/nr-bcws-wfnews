package ca.bc.gov.nrs.wfone.persistence.v1.dao.mybatis.mapper;

import java.util.List;
import java.util.Map;

import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFFormDto;

public interface RoFFormMapper {
    int insert(Map<String, Object> parameters);
    List<RoFFormDto> select();
    RoFFormDto fetch(Map<String, Object> parameters);
    int delete(Map<String, Object> parameters);
    int update(Map<String, Object> parameters);
}
