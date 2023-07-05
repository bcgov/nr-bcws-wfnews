package ca.bc.gov.nrs.wfone.persistence.v1.dao;

import java.util.List;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.persistence.v1.dto.RoFImageDto;

public interface RoFImageDao {

  	void insert(RoFImageDto dto) throws DaoException;
    List<RoFImageDto> select(String reportOfFireCacheGuid) throws DaoException;
    int delete(RoFImageDto dto) throws DaoException;
}