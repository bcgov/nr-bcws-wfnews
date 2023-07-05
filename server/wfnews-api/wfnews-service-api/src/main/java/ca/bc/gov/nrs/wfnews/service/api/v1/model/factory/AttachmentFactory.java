package ca.bc.gov.nrs.wfnews.service.api.v1.model.factory;

import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentResource;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.AttachmentDto;

public interface AttachmentFactory {
  AttachmentResource getAttachment(
    AttachmentDto dto, 
    FactoryContext context) 
    throws FactoryException;

  AttachmentListResource getAttachmentList(
    PagedDtos<AttachmentDto> attachmentList, 
    Integer pageNumber,
    Integer pageRowCount, 
    FactoryContext factoryContext)
    throws FactoryException;
}
