package ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HourliesPage extends LinkedPage<Weather> {
	
	@JsonProperty("_embedded")
	public void setEmbedded(Holder embedded) {
		setItems(embedded.hourlies);
	}
	
	public class Holder {
		@JsonProperty("hourlies")
		public List<Weather> hourlies;
	}
	
}
