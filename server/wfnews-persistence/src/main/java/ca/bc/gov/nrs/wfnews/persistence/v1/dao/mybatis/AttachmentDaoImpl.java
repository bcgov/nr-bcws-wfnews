package ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis;

import ca.bc.gov.nrs.wfnews.persistence.v1.dao.AttachmentDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.AttachmentDto;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.common.persistence.dao.DaoException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import ca.bc.gov.nrs.wfnews.persistence.v1.dao.BaseDao;
import ca.bc.gov.nrs.wfnews.persistence.v1.dao.mybatis.mapper.AttachmentMapper;

public class AttachmentDaoImpl extends BaseDao implements AttachmentDao {
  private static final Logger logger = LoggerFactory.getLogger(AttachmentDaoImpl.class);

	@Autowired
	private AttachmentMapper attachmentMapper;

  @Override
  public void insert(AttachmentDto dto) throws DaoException {
    logger.debug("<insert");

		String attachmentGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<>();

			parameters.put("dto", dto);
			parameters.put("fileAttachmentGuid", dto.getAttachmentGuid());
			int count = this.attachmentMapper.insertAttachment(parameters);

			if (count == 0) {
				throw new DaoException("Record not inserted: " + count);
			}
			
			attachmentGuid = (String) parameters.get("fileAttachmentGuid");
			dto.setAttachmentGuid(attachmentGuid);

			int metaCount = this.attachmentMapper.insertMeta(parameters);
			if (metaCount == 0) {
				throw new DaoException("Attachment Persisted, but Meta Record not inserted: " + count);
			}
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">insert " + attachmentGuid);
  }

  @Override
  public void update(AttachmentDto dto) throws DaoException {
    logger.debug("<update");

		String attachmentGuid = null;

		try {

			Map<String, Object> parameters = new HashMap<>();

			parameters.put("dto", dto);
			parameters.put("fileAttachmentGuid", dto.getAttachmentGuid());
			int count = this.attachmentMapper.update(parameters);
			
			if (Boolean.TRUE.equals(dto.isPrimary())) {
				updateForPrimaryInd(dto.getAttachmentGuid(), dto.getSourceObjectUniqueId());
			}

			if(count==0) {
				throw new DaoException("Record not inserted: "+count);
			}
			
			attachmentGuid = (String) parameters.get("fileAttachmentGuid");
			
			dto.setAttachmentGuid(attachmentGuid);
			
		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug(">update " + attachmentGuid);
  }

  @Override
  public AttachmentDto fetch(String attachmentGuid) throws DaoException {
    logger.debug("<fetch");

		AttachmentDto result = null;

		try {

			Map<String, Object> parameters = new HashMap<>();
			parameters.put("fileAttachmentGuid", attachmentGuid);
			result = this.attachmentMapper.fetch(parameters);

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
			this.attachmentMapper.flush();
		} catch (RuntimeException e) {
			handleException(e);
		}
		logger.debug("<flush");
	}

  @Override
  public void delete(String attachmentGuid, String userId) throws DaoException {
    logger.debug(">delete");
		
		try {

			Map<String, Object> parameters = new HashMap<>();
			parameters.put("attachmentGuid", attachmentGuid);
			parameters.put("userId", userId);
			int count = this.attachmentMapper.delete(parameters);

			if(count==0) {
				throw new DaoException("Record not deleted: " + count);
			}

		} catch (RuntimeException e) {
			handleException(e);
		}

		logger.debug("<delete");
  }

  @Override
  public PagedDtos<AttachmentDto> select(String incidentNumberSequence, boolean primaryIndicator, String[] sourceObjectNameCodes, String[] attachmentTypeCodes, Integer pageNumber, Integer pageRowCount, String[] orderBy) throws DaoException {
    logger.debug("<select");

		PagedDtos<AttachmentDto> results = new PagedDtos<>();

		try {
			Map<String, Object> parameters = new HashMap<>();

      Integer offset = null;
			pageNumber = pageNumber==null ? Integer.valueOf(0) : pageNumber;
			if(pageRowCount != null) {
        offset = Integer.valueOf((pageNumber.intValue() - 1) * pageRowCount.intValue());
      }

			//avoid jdbc exception for offset when pageNumber is 0
			if (offset != null && offset < 0) offset = 0;
			parameters.put("offset", offset);
			parameters.put("pageRowCount", pageRowCount);
			parameters.put("incidentNumberSequence", incidentNumberSequence);
			parameters.put("primaryIndicator", primaryIndicator ? "T" : "F");
      parameters.put("sourceObjectNameCodes", sourceObjectNameCodes);
      parameters.put("attachmentTypeCodes", attachmentTypeCodes);
      parameters.put("orderBy", orderBy);

			List<AttachmentDto> dtos = this.attachmentMapper.select(parameters);

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
  
  private void updateForPrimaryInd(String attachmentGuid, String sourceObjectUniqueId) throws DaoException {
		logger.debug("<updateForPrimaryInd");
		
		try {
	
			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("attachmentGuid", attachmentGuid);
			parameters.put("sourceObjectUniqueId", sourceObjectUniqueId);
			this.attachmentMapper.updateForPrimaryInd(parameters);
				
			} catch (RuntimeException e) {
				handleException(e);
			}
			
		logger.debug(">updateForPrimaryInd");
	}
}
