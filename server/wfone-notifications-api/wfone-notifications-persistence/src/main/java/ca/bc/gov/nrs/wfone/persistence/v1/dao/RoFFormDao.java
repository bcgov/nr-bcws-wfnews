package ca.bc.gov.nrs.wfone.persistence.v1.dao;

import java.util.List;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFFormDto;

public interface RoFFormDao {
  	void insert(RoFFormDto dto) throws DaoException;
    List<RoFFormDto> select() throws DaoException;
    RoFFormDto fetch(String guid) throws DaoException;
    int delete(RoFFormDto dto) throws DaoException;
    int update(RoFFormDto dto) throws DaoException;
}