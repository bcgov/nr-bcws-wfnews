package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.PagedResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.api.model.v1.ExternalUriList;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.EXTERNAL_URI_LIST_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.EXTERNAL_URI_LIST)
public class ExternalUriListResource extends PagedResource implements ExternalUriList<ExternalUriResource> {
	private static final long serialVersionUID = 1L;
	
	private List<ExternalUriResource> collection = new ArrayList<ExternalUriResource>(0);
	
	public ExternalUriListResource() {
		collection = new ArrayList<ExternalUriResource>();
	}
	
	@Override
	public List<ExternalUriResource> getCollection() {
		return collection;
	}

	@Override
	public void setCollection(List<ExternalUriResource> collection) {
		this.collection = collection;
	}
}