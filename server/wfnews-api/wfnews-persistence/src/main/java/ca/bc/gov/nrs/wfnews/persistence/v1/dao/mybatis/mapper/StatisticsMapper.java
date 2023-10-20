package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper;

import java.util.Map;

import ca.bc.gov.nrs.wfnews.persistence.v1.dto.StatisticsDto;

public interface StatisticsMapper {
  StatisticsDto fetch(Map<String, Object> parameters);
}
