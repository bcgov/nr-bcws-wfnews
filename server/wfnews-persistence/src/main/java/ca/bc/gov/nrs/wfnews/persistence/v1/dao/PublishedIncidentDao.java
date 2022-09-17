package ca.bc.gov.nrs.wfnews.persistence.v1.dao;

import java.io.Serializable;
import java.util.List;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.PublishedIncidentMapper;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PublishedIncidentDto;

public interface PublishedIncidentDao extends Serializable {
	
	 void insert(
		        PublishedIncidentDto dto) 
		        throws DaoException;
	 
	 void update(
		        PublishedIncidentDto dto) 
		        throws DaoException;
	 
	 PublishedIncidentDto fetch(
		        String publishedIncidentDetailGuid) 
		        throws DaoException;
	 
	 PublishedIncidentDto fetchForIncidentGuid(
			 String incidentGuid) 
				        throws DaoException;
	 
	 void setPublishedIncidentMapper(PublishedIncidentMapper publishedIncidentMapper);
	 
	 void delete(String publishedIncidentDetailGuid, String userId) throws DaoException, NotFoundDaoException;

	PagedDtos<PublishedIncidentDto> select(Integer pageNumber, Integer pageRowCount) throws DaoException;
		    
}