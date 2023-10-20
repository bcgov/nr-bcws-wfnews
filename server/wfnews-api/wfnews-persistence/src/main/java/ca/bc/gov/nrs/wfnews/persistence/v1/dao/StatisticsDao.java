package ca.bc.gov.nrs.wfnews.persistence.v1.dao;

import java.io.Serializable;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.StatisticsDto;

public interface StatisticsDao extends Serializable {
  StatisticsDto fetch(String fireCentre, Integer fireYear) throws DaoException;
}
