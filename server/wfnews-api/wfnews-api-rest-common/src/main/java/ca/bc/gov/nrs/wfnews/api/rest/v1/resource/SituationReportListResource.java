package ca.bc.gov.nrs.wfnews.api.rest.v1.resource;

import java.util.ArrayList;
import java.util.List;

import ca.bc.gov.nrs.wfnews.api.model.v1.SituationReportList;

import javax.xml.bind.annotation.XmlRootElement;

import org.codehaus.jackson.annotate.JsonTypeInfo;
import org.codehaus.jackson.annotate.JsonTypeName;

import ca.bc.gov.nrs.common.rest.resource.PagedResource;
import ca.bc.gov.nrs.wfnews.api.rest.v1.resource.types.ResourceTypes;

@XmlRootElement(namespace = ResourceTypes.NAMESPACE, name = ResourceTypes.SITUATION_REPORT_LIST_NAME)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "@type")
@JsonTypeName(ResourceTypes.SITUATION_REPORT_LIST)
public class SituationReportListResource extends PagedResource implements SituationReportList<SituationReportResource> {
	private static final long serialVersionUID = 1L;
	
	private List<SituationReportResource> collection = new ArrayList<SituationReportResource>(0);
	
	public SituationReportListResource() {
		collection = new ArrayList<SituationReportResource>();
	}
	
	@Override
	public List<SituationReportResource> getCollection() {
		return collection;
	}

	@Override
	public void setCollection(List<SituationReportResource> collection) {
		this.collection = collection;
	}
}
