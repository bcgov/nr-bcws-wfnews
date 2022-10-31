package ca.bc.gov.nrs.wfnews.persistence.v1.dao;

import ca.bc.gov.nrs.wfnews.persistence.v1.dto.AttachmentDto;
import ca.bc.gov.nrs.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;

public interface AttachmentDao {
  void insert(AttachmentDto dto) throws DaoException;
  void update(AttachmentDto dto) throws DaoException;
  AttachmentDto fetch(String attachmentGuid) throws DaoException;
  void delete(String attachmentGuid, String userId) throws DaoException;
  PagedDtos<AttachmentDto> select(String incidentNumberSequence, boolean primaryIndicator, String[] sourceObjectNameCodes, String[] attachmentTypeCodes, Integer pageNumber, Integer pageRowCount, String[] orderBy) throws DaoException;
}
