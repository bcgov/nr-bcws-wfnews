package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.common.persistence.dao.NotFoundDaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.BaseDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.SituationReportDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.SituationReportMapper;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.SituationReportDto;

public class SituationReportDaoImpl extends BaseDao implements SituationReportDao {
  private static final long serialVersionUID = 1L;
	private static final Logger logger = LoggerFactory.getLogger(SituationReportDaoImpl.class);
	
	public void setSituationReportMapper(SituationReportMapper situationReportMapper) {
		this.situationReportMapper = situationReportMapper;
	}
	
	@Autowired
	private SituationReportMapper situationReportMapper;

	public void insert(SituationReportDto dto) throws DaoException {
		logger.debug("<insert");

		String reportGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("dto", dto);
			parameters.put("reportGuid", dto.getReportGuid());
			int count = this.situationReportMapper.insert(parameters);

			if (count == 0) {
				throw new DaoException("Record not inserted: " + count);
			}
			
			reportGuid = (String) parameters.get("reportGuid");
			
			dto.setReportGuid(reportGuid);
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">insert " + reportGuid);
	}

	public void update(SituationReportDto dto) throws DaoException {
		logger.debug("<update");

		String reportGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();

			parameters.put("dto", dto);
			parameters.put("reportGuid", dto.getReportGuid());
			int count = this.situationReportMapper.update(parameters);

			if(count==0) {
				throw new DaoException("Record not inserted: "+count);
			}
			
			reportGuid = (String) parameters.get("reportGuid");
			
			dto.setReportGuid(reportGuid);
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">update " + reportGuid);
	}

	public void delete(String reportGuid) throws DaoException, NotFoundDaoException {
		logger.debug(">delete");
		
		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("reportGuid", reportGuid);
			int count = this.situationReportMapper.delete(parameters);

			if(count==0) {
				throw new DaoException("Record not deleted: "+count);
			}

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug("<delete");
		
	}

	public SituationReportDto fetch(String reportGuid) throws DaoException {
		logger.debug("<fetch");

		SituationReportDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("reportGuid", reportGuid);
			result = this.situationReportMapper.fetch(parameters);

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">fetch " + result);
		return result;
	}

	public PagedDtos<SituationReportDto> select(Integer pageNumber, Integer pageRowCount, Boolean published) throws DaoException {
		logger.debug("<select");

		PagedDtos<SituationReportDto> results = new PagedDtos<SituationReportDto>();

		try {
			Map<String, Object> parameters = new HashMap<String, Object>();
			Integer offset = null;
			pageNumber = pageNumber==null?Integer.valueOf(0):pageNumber;
			if(pageRowCount != null) { offset = Integer.valueOf((pageNumber.intValue()-1)*pageRowCount.intValue()); }
			//avoid jdbc exception for offset when pageNumber is 0
			if (offset != null && offset < 0) offset = 0;
			parameters.put("offset", offset);
			parameters.put("pageRowCount", pageRowCount);
			parameters.put("published", published);
			List<SituationReportDto> dtos = this.situationReportMapper.select(parameters);
			int totalRowCount = this.situationReportMapper.selectCount(parameters);
			results.setResults(dtos);
			results.setPageRowCount(dtos.size());
			results.setTotalRowCount(totalRowCount);
			results.setPageNumber(pageNumber == null ? 0 : pageNumber.intValue());

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">select " + results);
		return results;
	}

}
