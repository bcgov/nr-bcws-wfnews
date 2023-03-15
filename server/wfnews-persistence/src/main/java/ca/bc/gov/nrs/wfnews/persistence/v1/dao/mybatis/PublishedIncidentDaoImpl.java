package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis;

import java.time.Year;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.BaseDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.PublishedIncidentDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.PublishedIncidentMapper;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PublishedIncidentDto;

@Repository
public class PublishedIncidentDaoImpl extends BaseDao implements
		PublishedIncidentDao {

	private static final long serialVersionUID = 1L;
	
	private static final Logger logger = LoggerFactory.getLogger(PublishedIncidentDaoImpl.class);
	
	public void setPublishedIncidentMapper(PublishedIncidentMapper publishedIncidentMapper) {
		this.publishedIncidentMapper = publishedIncidentMapper;
	}
	
	@Autowired
	private PublishedIncidentMapper publishedIncidentMapper;

	@Override
	public void insert(PublishedIncidentDto dto) throws DaoException {
		logger.debug("<insert");

		String publishedIncidentGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("dto", dto);
			parameters.put("publishedIncidentDetailGuid", dto.getPublishedIncidentDetailGuid());
			int count = this.publishedIncidentMapper.insert(parameters);

			if(count==0) {
				throw new DaoException("Record not inserted: "+count);
			}
			
			publishedIncidentGuid = (String) parameters.get("publishedIncidentDetailGuid");
			
			dto.setPublishedIncidentDetailGuid(publishedIncidentGuid);
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">insert " + publishedIncidentGuid);
	}
	
	@Override
	public void update(PublishedIncidentDto dto) throws DaoException {
		logger.debug("<update");

		String publishedIncidentGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("dto", dto);
			parameters.put("publishedIncidentDetailGuid", dto.getPublishedIncidentDetailGuid());
			int count = this.publishedIncidentMapper.update(parameters);

			if(count==0) {
				throw new DaoException("Record not inserted: "+count);
			}
			
			publishedIncidentGuid = (String) parameters.get("publishedIncidentDetailGuid");
			
			dto.setPublishedIncidentDetailGuid(publishedIncidentGuid);
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">update " + publishedIncidentGuid);
	}
	
	@Override
	public PublishedIncidentDto fetch(String publishedIncidentDetailGuid, Integer fireYear) throws DaoException {
		logger.debug("<fetch");

		PublishedIncidentDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("publishedIncidentDetailGuid", publishedIncidentDetailGuid);
			parameters.put("fireYear", fireYear);
			result = this.publishedIncidentMapper.fetch(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">fetch " + result);
		return result;
	}
	
	@Override
	public PublishedIncidentDto fetchForIncidentGuid(String incidentGuid) throws DaoException {
		logger.debug("<fetch");

		PublishedIncidentDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("incidentGuid", incidentGuid);
			result = this.publishedIncidentMapper.fetchForIncidentGuid(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">fetch " + result);
		return result;
	}
	
	@Override
	public void flush() throws DaoException {
		logger.debug(">flush");
		try {
			this.publishedIncidentMapper.flush();
		} catch (RuntimeException e) {
			handleException(e);
		}
		logger.debug("<flush");
	}

	@Override
	public void delete(String publishedIncidentDetailGuid) throws DaoException, NotFoundDaoException {
		logger.debug(">delete");
		
		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("publishedIncidentDetailGuid", publishedIncidentDetailGuid);
			int count = this.publishedIncidentMapper.delete(parameters);

			if(count==0) {
				throw new DaoException("Record not deleted: "+count);
			}

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug("<delete");
		
	}
	
	@Override
	public String selectAsJson(String stageOfControlCode, String bbox) throws DaoException {
		String json = "";
		try {
			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("stageOfControlCode", stageOfControlCode);
			parameters.put("xmin", Double.parseDouble(bbox.split(",")[0]));
			parameters.put("ymin", Double.parseDouble(bbox.split(",")[1]));
			parameters.put("xmax", Double.parseDouble(bbox.split(",")[2]));
			parameters.put("ymax", Double.parseDouble(bbox.split(",")[3]));
			parameters.put("currentFireYear", getCurrentFireYear());

			json = this.publishedIncidentMapper.selectAsJson(parameters);
		} catch (RuntimeException e) {
			handleException(e);
		}

		return json;
	}

	@Override
	public String selectFireOfNoteAsJson(String bbox) throws DaoException {
		String json = "";
		try {
			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("xmin", Double.parseDouble(bbox.split(",")[0]));
			parameters.put("ymin", Double.parseDouble(bbox.split(",")[1]));
			parameters.put("xmax", Double.parseDouble(bbox.split(",")[2]));
			parameters.put("ymax", Double.parseDouble(bbox.split(",")[3]));

			json = this.publishedIncidentMapper.selectFireOfNoteAsJson(parameters);
		} catch (RuntimeException e) {
			handleException(e);
		}

		return json;
	}

	@Override
	public PagedDtos<PublishedIncidentDto> select(String searchText, Integer pageNumber, Integer pageRowCount, List<String> orderBy, Boolean fireOfNote, List<String> stageOfControlList, Boolean newFires, String fireCentreCode, String fireCentreName, Date fromCreateDate, Date toCreateDate, Date fromDiscoveryDate, Date toDiscoveryDate, String bbox, Double latitude, Double longitude, Integer fireYear, Double radius) throws DaoException{
		
		PagedDtos<PublishedIncidentDto> results = new PagedDtos<>();
		
		try {

			Map<String, Object> parameters = new HashMap<>();
			
			Integer offset = null;
			
			pageNumber = pageNumber == null ? 0 : pageNumber;

			if (pageRowCount != null) { 
				offset = Integer.valueOf((pageNumber.intValue() - 1) * pageRowCount.intValue());
			}
			//avoid jdbc exception for offset when pageNumber is 0
			if (offset != null && offset < 0) offset = 0;

			parameters.put("offset", offset);
			parameters.put("pageRowCount", pageRowCount);
			parameters.put("orderBy", orderBy.toArray());
			parameters.put("fireOfNote", fireOfNote);
			parameters.put("stageOfControlList", stageOfControlList);
			parameters.put("newFires", newFires);
			parameters.put("fireCentreCode", fireCentreCode);
			parameters.put("fireCentreName", fireCentreName);
			parameters.put("fromCreateDate", fromCreateDate);
			parameters.put("toCreateDate", toCreateDate);
			parameters.put("fromDiscoveryDate", fromDiscoveryDate);
			parameters.put("toDiscoveryDate", toDiscoveryDate);
			parameters.put("xmin", bbox != null ? Double.parseDouble(bbox.split(",")[0]) : null);
			parameters.put("ymin", bbox != null ? Double.parseDouble(bbox.split(",")[1]) : null);
			parameters.put("xmax", bbox != null ? Double.parseDouble(bbox.split(",")[2]) : null);
			parameters.put("ymax", bbox != null ? Double.parseDouble(bbox.split(",")[3]) : null);
			parameters.put("latitude", latitude);
			parameters.put("longitude", longitude);
			parameters.put("radius", radius);
			parameters.put("searchText", searchText);
			parameters.put("currentFireYear", fireYear != null ? fireYear.intValue() : getCurrentFireYear());
			
			int totalRowCount = this.publishedIncidentMapper.selectCount(parameters);
			List<PublishedIncidentDto> dtos = this.publishedIncidentMapper.select(parameters);
			results.setResults(dtos);
			results.setPageRowCount(dtos.size());
			results.setTotalRowCount(totalRowCount);
			results.setPageNumber(pageNumber == null ? 0 : pageNumber.intValue());

		} catch (RuntimeException e) {
			handleException(e);
		}
		
		return results;
	}

	private int getCurrentFireYear() {
		int currentYear = Year.now().getValue();
		if (Calendar.getInstance().get(Calendar.MONTH) < 3) {
			currentYear -= 1;
		}
		return currentYear;
	}
}
	