package ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DailiesPage extends LinkedPage<DailyWeather> {
	
	@JsonProperty("_embedded")
	public void setEmbedded(Holder embedded) {
		setItems(embedded.dailies);
	}
	
	public class Holder {
		@JsonProperty("dailies")
		public List<DailyWeather> dailies;
	}
	
}
