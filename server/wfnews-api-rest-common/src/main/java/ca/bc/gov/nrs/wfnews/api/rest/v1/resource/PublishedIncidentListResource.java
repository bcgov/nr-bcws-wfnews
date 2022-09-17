package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.PagedResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.api.model.v1.PublishedIncidentList;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.PUBLISHED_INCIDENT_LIST_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.PUBLISHED_INCIDENT_LIST)
public class PublishedIncidentListResource extends PagedResource implements PublishedIncidentList<PublishedIncidentResource> {
	private static final long serialVersionUID = 1L;
	
	private List<PublishedIncidentResource> collection = new ArrayList<PublishedIncidentResource>(0);
	
	public PublishedIncidentListResource() {
		collection = new ArrayList<PublishedIncidentResource>();
	}
	
	@Override
	public List<PublishedIncidentResource> getCollection() {
		return collection;
	}

	@Override
	public void setCollection(List<PublishedIncidentResource> collection) {
		this.collection = collection;
	}
}