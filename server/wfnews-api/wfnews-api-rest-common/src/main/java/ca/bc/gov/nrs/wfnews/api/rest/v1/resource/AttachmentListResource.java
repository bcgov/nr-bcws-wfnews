package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.PagedResource;
import ca.bc.gov.nrs.wfnews.api.model.v1.AttachmentList;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.ATTACHMENT_LIST_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.ATTACHMENT_LIST)
public class AttachmentListResource extends PagedResource implements AttachmentList<AttachmentResource> {
	private static final long serialVersionUID = 1L;
	
	private List<AttachmentResource> collection = new ArrayList<AttachmentResource>(0);
	
	public AttachmentListResource() {
		collection = new ArrayList<AttachmentResource>();
	}
	
	@Override
	public List<AttachmentResource> getCollection() {
		return collection;
	}

	@Override
	public void setCollection(List<AttachmentResource> collection) {
		this.collection = collection;
	}
}
