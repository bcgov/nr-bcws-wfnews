package ca.bc.gov.nrs.wfnews.persistence.v1.dao;

import java.io.Serializable;
import java.util.List;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.ExternalUriMapper;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.ExternalUriDto;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;

public interface ExternalUriDao extends Serializable {
	
	 void insert(
			 ExternalUriDto dto) 
		        throws DaoException;
	 
	 void update(
			 ExternalUriDto dto) 
		        throws DaoException;
	 
	 ExternalUriDto fetch(
		        String externalUriGuid) 
		        throws DaoException;
	 
	 PagedDtos<ExternalUriDto> fetchAll(Integer pageNumber, Integer pageRowCount)
		        throws DaoException;
	 	 	 
	 void delete(String publishedIncidentDetailGuid, String userId) throws DaoException, NotFoundDaoException;
	 
	 PagedDtos<ExternalUriDto> select(Integer pageNumber, Integer pageRowCount) throws DaoException;

	PagedDtos<ExternalUriDto> selectForIncident(String sourceObjectUniqueId, Integer pageNumber, Integer pageRowCount) throws DaoException;
		    
}