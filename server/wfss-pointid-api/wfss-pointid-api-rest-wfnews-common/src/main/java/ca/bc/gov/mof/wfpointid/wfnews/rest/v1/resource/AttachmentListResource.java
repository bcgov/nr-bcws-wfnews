package ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource;

import java.io.Serial;
import java.util.ArrayList;
import java.util.List;

import jakarta.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;

import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.common.rest.resource.PagedResource;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.ATTACHMENT_LIST_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.ATTACHMENT_LIST)
public class AttachmentListResource extends PagedResource {
	@Serial
	private static final long serialVersionUID = 1L;
	
	private List<AttachmentResource> collection = new ArrayList<AttachmentResource>(0);
	
	public AttachmentListResource() {
		collection = new ArrayList<AttachmentResource>();
	}
	
	public List<AttachmentResource> getCollection() {
		return collection;
	}

	public void setCollection(List<AttachmentResource> collection) {
		this.collection = collection;
	}
}
