package ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.PagedResource;
import ca.bc.gov.mof.wfpointid.wfnews.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.PUBLISHED_INCIDENT_LIST_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NONE,  // Fix for WFNEWS returning the wrong key and with a null value
	include = JsonTypeInfo.As.PROPERTY, property = "_type")
@JsonTypeName(ResourceTypes.PUBLISHED_INCIDENT_LIST)
@JsonIgnoreProperties(ignoreUnknown=true)
public class PublishedIncidentListResource extends PagedResource {
	private static final long serialVersionUID = 1L;
	
	private List<SimplePublishedIncidentResource> collection = new ArrayList<SimplePublishedIncidentResource>(0);
	
	public PublishedIncidentListResource() {
		collection = new ArrayList<SimplePublishedIncidentResource>();
	}
	
	public List<SimplePublishedIncidentResource> getCollection() {
		return collection;
	}

	public void setCollection(List<SimplePublishedIncidentResource> collection) {
		this.collection = collection;
	}
}