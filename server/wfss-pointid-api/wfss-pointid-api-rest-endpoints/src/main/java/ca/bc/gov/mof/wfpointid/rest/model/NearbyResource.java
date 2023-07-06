package ca.bc.gov.mof.wfpointid.rest.model;

import java.util.List;
import java.util.Map;

public class NearbyResource  extends QueryResource {
	
	private Double radius;
	
	private List<Map<String, Object>> features;
	
	public NearbyResource() {
		super();
	}

	public Double getRadius() {
		return radius;
	}

	public void setRadius(Double radius) {
		this.radius = radius;
	}

	public List<Map<String, Object>> getFeatures() {
		return features;
	}

	public void setFeatures(List<Map<String, Object>> features) {
		this.features = features;
	}

}
