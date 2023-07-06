package ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class WeatherStationPage extends LinkedPage<WeatherStationResource> {
	
	@JsonProperty("_embedded")
	public void setEmbedded(Holder embedded) {
		setItems(embedded.stations);
	}
	public class Holder {
		@JsonProperty("stations")
		public List<WeatherStationResource> stations;
	}
}
