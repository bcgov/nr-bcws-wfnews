package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.io.Serial;
import java.util.ArrayList;
import java.util.List;

import jakarta.xml.bind.annotation.XmlRootElement;

import ca.bc.gov.nrs.common.rest.resource.PagedResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;
import ca.bc.gov.nrs.wfnews.api.model.v1.ExternalUriList;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.EXTERNAL_URI_LIST_NAME)
public class ExternalUriListResource extends PagedResource implements ExternalUriList<ExternalUriResource> {
	@Serial
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