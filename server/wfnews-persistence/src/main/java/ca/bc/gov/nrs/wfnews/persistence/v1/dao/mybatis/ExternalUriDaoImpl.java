package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis;

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
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.ExternalUriDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.ExternalUriMapper;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.ExternalUriDto;

@Repository
public class ExternalUriDaoImpl extends BaseDao implements
	ExternalUriDao {

	private static final long serialVersionUID = 1L;
	
	private static final Logger logger = LoggerFactory.getLogger(ExternalUriDaoImpl.class);
	
	public void setExternalUriMapper(ExternalUriMapper externalUriMapper) {
		this.externalUriMapper = externalUriMapper;
	}
	
	@Autowired
	private ExternalUriMapper externalUriMapper;

	@Override
	public void insert(ExternalUriDto dto) throws DaoException {
		logger.debug("<insert");

		String externalUriGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("dto", dto);
			parameters.put("externalUriGuid", dto.getExternalUriGuid());
			int count = this.externalUriMapper.insert(parameters);

			if(count==0) {
				throw new DaoException("Record not inserted: "+count);
			}
			
			externalUriGuid = (String) parameters.get("externalUriGuid");
			
			dto.setExternalUriGuid(externalUriGuid);
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">insert " + externalUriGuid);
	}
	
	@Override
	public void update(ExternalUriDto dto) throws DaoException {
		logger.debug("<update");

		String externalUriGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("dto", dto);
			parameters.put("externalUriGuid", dto.getExternalUriGuid());
			int count = this.externalUriMapper.update(parameters);

			if(count==0) {
				throw new DaoException("Record not inserted: "+count);
			}
			
			externalUriGuid = (String) parameters.get("externalUriGuid");
			
			dto.setExternalUriGuid(externalUriGuid);
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">update " + externalUriGuid);
	}
	
	@Override
	public ExternalUriDto fetch(String externalUriGuid) throws DaoException {
		logger.debug("<fetch");

		ExternalUriDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("externalUriGuid", externalUriGuid);
			result = this.externalUriMapper.fetch(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">fetch " + result);
		return result;
	}
	
	@Override
	public PagedDtos<ExternalUriDto> fetchAll(Integer pageNumber, Integer pageRowCount) throws DaoException {
		logger.debug("<fetchAll");

		PagedDtos<ExternalUriDto> results = new PagedDtos<ExternalUriDto>();

		try {
			List<ExternalUriDto> dtos = this.externalUriMapper.fetchAll();
			results.setResults(dtos);
			results.setPageRowCount(dtos.size());
			results.setTotalRowCount(dtos.size());
			results.setPageNumber(pageNumber == null ? 0 : pageNumber.intValue());

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">fetchAll " + results);
		return results;
	}
	
	
	
	@Override
	public void delete(String externalUriGuid, String userId) throws DaoException, NotFoundDaoException {
		logger.debug(">delete");
		
		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("externalUriGuid", externalUriGuid);
			parameters.put("userId", userId);
			int count = this.externalUriMapper.delete(parameters);

			if(count==0) {
				throw new DaoException("Record not deleted: "+count);
			}

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug("<delete");
		
	}
	
	@Override
	public PagedDtos<ExternalUriDto> select(Integer pageNumber, Integer pageRowCount) throws DaoException {
		logger.debug("<select");

		PagedDtos<ExternalUriDto> results = new PagedDtos<ExternalUriDto>();

		try {
			Map<String, Object> parameters = new HashMap<String, Object>();
			Integer offset = null;
			pageNumber = pageNumber==null?Integer.valueOf(0):pageNumber;
			if(pageRowCount != null) { offset = Integer.valueOf((pageNumber.intValue()-1)*pageRowCount.intValue()); }
			//avoid jdbc exception for offset when pageNumber is 0
			if (offset != null && offset < 0) offset = 0;
			parameters.put("offset", offset);
			parameters.put("pageRowCount", pageRowCount);
			List<ExternalUriDto> dtos = this.externalUriMapper.select(parameters);
			results.setResults(dtos);
			results.setPageRowCount(dtos.size());
			results.setTotalRowCount(dtos.size());
			results.setPageNumber(pageNumber == null ? 0 : pageNumber.intValue());

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">select " + results);
		return results;
	}
	
	@Override
	public PagedDtos<ExternalUriDto> selectForIncident(String sourceObjectUniqueId, Integer pageNumber, Integer pageRowCount) throws DaoException{
		
		PagedDtos<ExternalUriDto> results = new PagedDtos<>();	
		
		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			Integer offset = null;
			int totalRowCount = this.externalUriMapper.selectCount(parameters);
			if(pageRowCount != null) { offset = Integer.valueOf((pageNumber.intValue()-1)*pageRowCount.intValue()); }
			//avoid jdbc exception for offset when pageNumber is 0
			if (offset != null && offset < 0) offset = 0;
			parameters.put("sourceObjectUniqueId", sourceObjectUniqueId);
			parameters.put("offset", offset);
			parameters.put("pageRowCount", pageRowCount);
			List<ExternalUriDto> dtos = this.externalUriMapper.selectForIncident(parameters);
			results.setResults(dtos);
			results.setPageRowCount(dtos.size());
			results.setTotalRowCount(totalRowCount);
			results.setPageNumber(pageNumber == null ? 0 : pageNumber.intValue());

		} catch (RuntimeException e) {
			handleException(e);
		}
		
		return results;

	}
	

}