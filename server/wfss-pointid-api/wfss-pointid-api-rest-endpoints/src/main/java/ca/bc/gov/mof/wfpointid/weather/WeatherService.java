package ca.bc.gov.mof.wfpointid.weather;

import ca.bc.gov.mof.wfpointid.ServiceErrorException;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherResource;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherStation;

public abstract class WeatherService {
	
	public abstract WeatherResource queryWeatherData(QueryPt pt, String hourstamp, int hourlyDuration, int dailyDuration) throws ServiceErrorException;
	
	public abstract WeatherResource queryWeatherStationData(int code, String hourstamp, int hourlyDuration, int dailyDuration) throws ServiceErrorException;
	
	protected static WeatherResource createResource(QueryPt pt, WeatherStation stn) {
		WeatherResource res = new WeatherResource();
		if(pt!=null) {
			res.setLon(pt.getLon());
			res.setLat(pt.getLat());
		}
		res.setStations(new WeatherStation[] { stn });
		return res;
	}
}
