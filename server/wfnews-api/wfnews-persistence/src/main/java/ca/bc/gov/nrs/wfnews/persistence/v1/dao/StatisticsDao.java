package ca.bc.gov.nrs.wfnews.persistence.v1.dao;

import java.io.Serializable;
import java.util.List;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.StatisticsDto;

public interface StatisticsDao extends Serializable {
  List<StatisticsDto> fetch(String fireCentre, Integer fireYear) throws DaoException;
}
