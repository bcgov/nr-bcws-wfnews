package ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1;

import java.time.temporal.TemporalAmount;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.locationtech.jts.geom.Point;

import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.DailyWeather;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.Weather;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.WeatherStationResource;

public interface WildfireFireweatherService {

	/**
	 * Get the weather station with id stationId.
	 */
	Optional<WeatherStationResource> getWeatherStation(String stationId) throws WildfireFireweatherServiceException;

	/**
	 * Get all weather stations.
	 */
	Collection<WeatherStationResource> getAllWeatherStations() throws WildfireFireweatherServiceException;

	/**
	 * Get all weather stations within distance metres of p.
	 */
	Collection<WeatherStationResource> getNearbyWeatherStations(Point p, double distance)
			throws WildfireFireweatherServiceException;

	/**
	 * Get the nearest weather station to p.
	 */
	WeatherStationResource getNearestWeatherStation(Point p) throws WildfireFireweatherServiceException;

	/**
	 * Get the nearest weather station to p provided it is less than distance meters from p.
	 */
	Optional<WeatherStationResource> getNearestWeatherStationWithin(Point p, double distance)
			throws WildfireFireweatherServiceException;

	/**
	 * Get Hourly weather for a particular station within a time range
	 * @param stationId UUID
	 * @param start milliseconds from epoch
	 * @param end milliseconds from epoch
	 */
	List<Weather> getHourlies(String stationId, Long start, Long end) throws WildfireFireweatherServiceException;

	/**
	 * Get Daily weather for a particular station within a time range
	 * @param stationId UUID
	 * @param start milliseconds from epoch
	 * @param end milliseconds from epoch
	 */
	List<DailyWeather> getDailies(String stationId, Long start, Long end) throws WildfireFireweatherServiceException;


	/**
	 * Get Hourly weather for a particular station within the given period from now.
	 * @param stationId UUID
	 * @param start milliseconds from epoch
	 * @param end milliseconds from epoch
	 */
	List<Weather> getHourlies(String stationId, TemporalAmount period) throws WildfireFireweatherServiceException;
	
	/**
	 * Get Daily weather for a particular station within the given period from now.
	 * @param stationId UUID
	 * @param start milliseconds from epoch
	 * @param end milliseconds from epoch
	 */
	List<DailyWeather> getDailies(String stationId, TemporalAmount period) throws WildfireFireweatherServiceException;

	/**
	 * Get a weather station using its code
	 * @param stationCode
	 */
	Optional<WeatherStationResource> getWeatherStationByCode(Integer stationCode)
			throws WildfireFireweatherServiceException;
}
