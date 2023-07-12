package ca.bc.gov.nrs.wfone.api.model.v1;

import java.io.Serializable;
import java.util.List;

public interface NotificationSettingsList<T> extends Serializable{

	List<T> getCollection();

	void setCollection(List<T> collection);

}