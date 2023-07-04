package ca.bc.gov.nrs.wfnews.persistence.v1.dao;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
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

	PublishedIncidentDto fetch(String publishedIncidentDetailGuid, Integer fireYear) throws DaoException;

	PublishedIncidentDto fetchForIncidentGuid(
			String incidentGuid)
			throws DaoException;

	void setPublishedIncidentMapper(PublishedIncidentMapper publishedIncidentMapper);

	void delete(String publishedIncidentDetailGuid) throws DaoException;

	void flush() throws DaoException;

	PagedDtos<PublishedIncidentDto> select(String searchText, Integer pageNumber, Integer pageRowCount, List<String> orderBy, Boolean fireOfNote, List<String> stageOfControlList, Boolean newFires, String fireCentreCode, String fireCentreName, Date fromCreateDate, Date toCreateDate, Date fromDiscoveryDate, Date toDiscoveryDate, String bbox, Double latitude, Double longitude, Integer fireYear, Double radius) throws DaoException;

	String selectAsJson(String stageOfControlCode, String bbox) throws DaoException;
	
	String selectFireOfNoteAsJson(String bbox) throws DaoException;
}