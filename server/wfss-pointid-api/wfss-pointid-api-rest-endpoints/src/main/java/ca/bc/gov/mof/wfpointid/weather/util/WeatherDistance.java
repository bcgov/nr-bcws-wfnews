package ca.bc.gov.mof.wfpointid.weather.util;

import static ca.bc.gov.mof.wfpointid.rest.client.GeometryConverters.geographicToProjected;
import static ca.bc.gov.mof.wfpointid.rest.client.GeometryConverters.latLon;

import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.locationtech.jts.geom.Point;
import org.opengis.referencing.operation.TransformException;

import ca.bc.gov.mof.wfpointid.ServiceErrorException;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.rest.model.DistantWeatherStation;
import ca.bc.gov.mof.wfpointid.rest.model.PositionedWeatherStation;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherStation;

public class WeatherDistance {
	
	private static Logger LOG = LoggerFactory.getLogger(WeatherDistance.class);
	
	static final long ACCURACY=100;
	
	public static double distance (QueryPt p1, QueryPt p2) throws ServiceErrorException {
		try {
			Point albersP1 = geographicToProjected(latLon(p1.getLat(), p1.getLon()));
			Point albersP2 = geographicToProjected(latLon(p2.getLat(), p2.getLon()));
			return albersP1.distance(albersP2);
		} catch (TransformException e) {
			throw new ServiceErrorException(ca.bc.gov.mof.wfpointid.Messages.ERROR_INTERNAL,e);
		}
	}
	
	public static WeatherStation obfuscateLocation (QueryPt p1, PositionedWeatherStation positioned) throws ServiceErrorException {
		LOG.info(String.format("Obfuscating weather station location %f, %f", positioned.getLat(), positioned.getLon()));
		WeatherStation result;
		if(Objects.nonNull(p1)) {
			LOG.debug("Replacing position with distance to query");
			result = new DistantWeatherStation();
			double distance = distance(p1, new QueryPt(positioned.getLon(), positioned.getLat()));
			long distanceRounded=Math.round(distance/ACCURACY)*ACCURACY;
			((DistantWeatherStation) result).setDistance(distanceRounded);
		} else {
			LOG.debug("Removing position");
			result = new WeatherStation();
		}
		result.setDaily(positioned.getDaily());
		result.setHourly(positioned.getHourly());
		result.setElevation(positioned.getElevation());
		result.setStationCode(positioned.getStationCode());
		result.setStationName(positioned.getStationName());
		return result;
	}
}
