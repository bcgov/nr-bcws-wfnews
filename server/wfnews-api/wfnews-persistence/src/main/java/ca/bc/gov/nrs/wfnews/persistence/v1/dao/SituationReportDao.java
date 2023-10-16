package ca.bc.gov.nrs.wfnews.persistence.v1.dao;

import java.io.Serializable;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.SituationReportDto;

public interface SituationReportDao extends Serializable {
  void insert(SituationReportDto dto) throws DaoException;
	void update(SituationReportDto dto) throws DaoException;
	void delete(String situationReportGuid) throws DaoException;
	SituationReportDto fetch(String reportGuid) throws DaoException;
	PagedDtos<SituationReportDto> select(Integer pageNumber, Integer pageRowCount, Boolean published) throws DaoException;
}
