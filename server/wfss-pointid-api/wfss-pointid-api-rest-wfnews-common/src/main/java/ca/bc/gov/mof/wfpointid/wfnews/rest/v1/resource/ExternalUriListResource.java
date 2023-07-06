package ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.PagedResource;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.EXTERNAL_URI_LIST_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.EXTERNAL_URI_LIST)
public class ExternalUriListResource extends PagedResource {
	private static final long serialVersionUID = 1L;
	
	private List<ExternalUriResource> collection = new ArrayList<ExternalUriResource>(0);
	
	public ExternalUriListResource() {
		collection = new ArrayList<ExternalUriResource>();
	}
	
	public List<ExternalUriResource> getCollection() {
		return collection;
	}

	public void setCollection(List<ExternalUriResource> collection) {
		this.collection = collection;
	}
}