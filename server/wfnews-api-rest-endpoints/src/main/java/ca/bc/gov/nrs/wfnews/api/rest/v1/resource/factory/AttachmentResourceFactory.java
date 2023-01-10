package ca.bc.gov.nrs.wfnews.api.rest.v1.resource.factory;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.core.UriBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

import ca.bc.gov.nrs.common.wfone.rest.resource.RelLink;
import ca.bc.gov.nrs.wfone.common.rest.endpoints.resource.factory.BaseResourceFactory;
import ca.bc.gov.nrs.wfone.common.service.api.model.factory.FactoryContext;
import ca.bc.gov.nrs.wfone.common.webade.authentication.WebAdeAuthentication;
import ca.bc.gov.nrs.common.service.model.factory.FactoryException;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.AttachmentsEndpoint;
import ca.bc.gov.nrs.wfnews.api.rest.v1.endpoints.security.Scopes;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentListResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.AttachmentResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.PagedDtos;
import ca.bc.gov.nrs.wfnews.persistence.v1.dto.AttachmentDto;
import ca.bc.gov.nrs.wfnews.service.api.v1.model.factory.AttachmentFactory;

public class AttachmentResourceFactory extends BaseResourceFactory implements AttachmentFactory {
  private static final Logger logger = LoggerFactory.getLogger(AttachmentResourceFactory.class);

  protected final boolean hasAuthority(String authorityName) {
    boolean result = false;

    WebAdeAuthentication webAdeAuthentication = getWebAdeAuthentication();

    if (webAdeAuthentication != null) {
      for (GrantedAuthority grantedAuthority : webAdeAuthentication.getAuthorities()) {
        String authority = grantedAuthority.getAuthority();
        if (authority.equalsIgnoreCase(authorityName)) {
          result = true;
          break;
        }
      }
    }

    return result;
  }

  protected static final WebAdeAuthentication getWebAdeAuthentication() {
    return (WebAdeAuthentication) SecurityContextHolder.getContext().getAuthentication();
  }

  private static void setSelfLink(AttachmentResource resource, URI baseUri) {
		String selfUri = getAttachmentSelfUri(resource.getAttachmentGuid(), baseUri);
		
		resource.getLinks().add(new RelLink(ResourceTypes.SELF, selfUri, "GET"));
	}

  private void setLinks(String attachmentGuid, AttachmentResource resource, URI baseUri){
		
		if (hasAuthority(Scopes.CREATE_ATTACHMENT)) {

				String result = UriBuilder
						.fromUri(baseUri)
						.path(AttachmentsEndpoint.class)
						.build(attachmentGuid).toString();
				resource.getLinks().add(new RelLink(ResourceTypes.CREATE_ATTACHMENT, result, "PUT"));
		}
		
		if (hasAuthority(Scopes.UPDATE_PUBLISHED_INCIDENT)) {

				String result = UriBuilder
						.fromUri(baseUri)
						.path(AttachmentsEndpoint.class)
						.build(attachmentGuid).toString();
				resource.getLinks().add(new RelLink(ResourceTypes.UPDATE_ATTACHMENT, result, "POST"));
		}

		if (hasAuthority(Scopes.DELETE_PUBLISHED_INCIDENT)) {

			String result = UriBuilder
					.fromUri(baseUri)
					.path(AttachmentsEndpoint.class)
					.build(attachmentGuid).toString();
			resource.getLinks().add(new RelLink(ResourceTypes.DELETE_ATTACHMENT, result, "DELETE"));
		}
	}

  public static String getAttachmentSelfUri(String attachmentGuid, URI baseUri) {
		
		String result = UriBuilder.fromUri(baseUri)
		.path(AttachmentsEndpoint.class)
		.build(attachmentGuid).toString();
		
		return result;
	}

  @Override
  public AttachmentResource getAttachment(AttachmentDto dto, FactoryContext context) throws FactoryException {
    logger.debug("<getAttachment");
		URI baseUri = getBaseURI(context);

		AttachmentResource result = new AttachmentResource();
		populate(result, dto);

		String eTag = getEtag(result);
		result.setETag(eTag);

		setSelfLink(result, baseUri);

		setLinks(dto.getAttachmentGuid(), result, baseUri);

		return result;
  }

  private void populate(AttachmentResource resource, AttachmentDto dto) {
		resource.setArchived(dto.isArchived());
    resource.setAttachmentDescription(dto.getAttachmentDescription());
    resource.setAttachmentGuid(dto.getAttachmentGuid());
    resource.setAttachmentTitle(dto.getAttachmentTitle());
    resource.setAttachmentTypeCode(dto.getAttachmentTypeCode());
    resource.setAzimuth(dto.getAzimuth());
    resource.setCreatedTimestamp(dto.getCreatedTimestamp());
    resource.setElevation(dto.getElevation());
    resource.setElevationAngle(dto.getElevationAngle());
    resource.setFileId(dto.getFileId());
    resource.setFileName(dto.getFileName());
    resource.setImageHeight(dto.getImageHeight());
    resource.setImageURL(dto.getImageURL());
    resource.setImageWidth(dto.getImageWidth());
    resource.setLatitude(dto.getLatitude());
    resource.setLongitude(dto.getLongitude());
    resource.setMimeType(dto.getMimeType());
    resource.setPrimary(dto.isPrimary());
    resource.setPrivateIndicator(dto.isPrivateIndicator());
    resource.setSourceObjectNameCode(dto.getSourceObjectNameCode());
    resource.setSourceObjectUniqueId(dto.getSourceObjectUniqueId());
    resource.setThumbId(dto.getThumbId());
    resource.setThumbnailURL(dto.getThumbnailURL());
    resource.setUploadedBy(dto.getUploadedBy());
    resource.setUploadedTimestamp(dto.getUploadedTimestamp());
  }

  @Override
  public AttachmentListResource getAttachmentList(PagedDtos<AttachmentDto> attachmentList, Integer pageNumber,
      Integer pageRowCount, FactoryContext factoryContext) throws FactoryException {
    AttachmentListResource result = null;
    URI baseUri = getBaseURI(factoryContext);

    List<AttachmentResource> resources = new ArrayList<>();
    for (AttachmentDto dto : attachmentList.getResults()) {
      AttachmentResource resource = new AttachmentResource();
      populate(resource, dto);
      setLinks(resource.getAttachmentGuid(), resource, baseUri);
      setSelfLink(resource, baseUri);
      resources.add(resource);
    }
    
    result = new AttachmentListResource();
    result.setCollection(resources);
    result.setTotalRowCount(attachmentList.getTotalRowCount());
    
    if (pageNumber != null && pageRowCount != null) {
      int totalPageCount = (int) Math.ceil(((double)attachmentList.getTotalRowCount()) / ((double)pageRowCount));
      result.setPageNumber(pageNumber);
      result.setPageRowCount(pageRowCount);
      result.setTotalPageCount(totalPageCount);
    }	

    String eTag = getEtag(result);
    result.setETag(eTag);
    
    return result;
  }
}
