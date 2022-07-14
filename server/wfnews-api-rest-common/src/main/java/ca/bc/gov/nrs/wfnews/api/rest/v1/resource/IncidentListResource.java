package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;


import ca.bc.gov.nrs.common.wfone.rest.resource.BaseResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.api.model.v1.IncidentList;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.INCIDENT_LIST)
public class IncidentListResource extends BaseResource implements IncidentList<IncidentResource>  {
	private static final long serialVersionUID = 1L;
	
	private List<IncidentResource> collection = new ArrayList<IncidentResource>(0);
	
	public IncidentListResource() {
		collection = new ArrayList<IncidentResource>();
	}
	
	@Override
	public List<IncidentResource> getCollection() {
		return collection;
	}

	@Override
	public void setCollection(List<IncidentResource> collection) {
		this.collection = collection;
	}
}