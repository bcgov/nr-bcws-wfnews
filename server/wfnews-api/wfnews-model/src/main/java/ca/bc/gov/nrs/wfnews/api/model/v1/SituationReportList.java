package ca.bc.gov.nrs.wfnews.api.model.v1;

import java.io.Serializable;
import java.util.List;

public interface SituationReportList<E extends SituationReport> extends Serializable {
	public List<E> getCollection();
	public void setCollection(List<E> collection);
}