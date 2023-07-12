package ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.impl;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.TemporalAmount;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.multimap.ArrayListValuedHashMap;
import org.locationtech.jts.geom.Point;
import org.opengis.referencing.operation.TransformException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.rest.client.GeometryConverters;
import ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.WildfireFireweatherService;
import ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.WildfireFireweatherServiceException;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.DailiesPage;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.DailyWeather;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.HourliesPage;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.Page;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.Weather;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.WeatherStationPage;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.WeatherStationResource;
import ca.bc.gov.mof.wfpointid.rest.client.BaseRestServiceClient;
import ca.bc.gov.mof.wfpointid.rest.client.GenericRestDAO;
import ca.bc.gov.mof.wfpointid.rest.client.MultipartData;
import ca.bc.gov.mof.wfpointid.rest.client.Response;
import ca.bc.gov.mof.wfpointid.rest.client.RestDAOException;

public class WildfireFireweatherServiceImpl extends BaseRestServiceClient implements WildfireFireweatherService {

	private static final String STATIONS_PATH = "v1/stations/";
	private static final String HOURLIES_PATH = "v1/hourlies/";
	private static final String HOURLIES_SEARCH_PATH = "search/findHourliesByWeatherTimestampBetweenAndStationIdEqualsOrderByWeatherTimestampAsc";
	private static final String DAILIES_PATH = "v1/dailies/";
	private static final String DAILIES_SEARCH_PATH = "search/findDailiesByStationIdEqualsAndWeatherTimestampBetweenOrderByWeatherTimestampAsc";
	private static final int PAGE_SIZE = 20;

	private static final Logger logger = LoggerFactory.getLogger(WildfireFireweatherServiceImpl.class);
	
	public static final String CLIENT_VERSION = "1";
	private static final long STATION_CACHE_MAX_AGE = 1000*60*60*24;
	
	private Clock clock = Clock.systemUTC();
	
	/**
	 * Constructor used for making OAuth2 Client Credentials requests
	 * @param webadeOauth2ClientId
	 * @param webadeOauth2ClientSecret
	 * @param webadeOauth2TokenUrl
	 */
	public WildfireFireweatherServiceImpl(String webadeOauth2ClientId, String webadeOauth2ClientSecret, String webadeOauth2TokenUrl, String scopes) {
		super(webadeOauth2ClientId, webadeOauth2ClientSecret, webadeOauth2TokenUrl, scopes);
		logger.debug("<WildfireFireweatherServiceImpl");
		
		logger.debug(">WildfireFireweatherServiceImpl");
	}

	public String getClientVersion() {
		return CLIENT_VERSION;
	}

	@Override
	public Optional<WeatherStationResource> getWeatherStation(final String stationId)
			throws WildfireFireweatherServiceException {

		GenericRestDAO<WeatherStationResource> dao = this.getRestDAOFactory().getGenericRestDAO(WeatherStationResource.class);
		
		try {
			
			URI topLevelRestURL = new URI(getTopLevelRestURL());
			String urlString = topLevelRestURL.resolve(STATIONS_PATH).resolve(stationId).toString();
			String method = "GET";
			String eTag = null;
			Object resource = null;
			MultipartData[] files = null;
			Map<String,String> headerParams = null; 
			MultiValuedMap<String,String> queryParams = null;
			
			Response<WeatherStationResource> response = dao.Process(getTransformer(), urlString, method, eTag, resource, files, headerParams, queryParams, getRestTemplate());
			
			return Optional.ofNullable(response.getResource());
			
		} catch (RestDAOException e) {
			throw new WildfireFireweatherServiceException(e);
		} catch (URISyntaxException e) {
			throw new WildfireFireweatherServiceException(e);
		}
	}
	
	@Override
	public Optional<WeatherStationResource> getWeatherStationByCode(final Integer stationCode)
			throws WildfireFireweatherServiceException {
		
		// Works for now, can index the cache if it's too slow.
		return getAllWeatherStations().stream()
				.filter(station->station.getStationCode().equals(stationCode))
				.findAny();
	}
	
	private <T, P extends Page<T>> List<T> doGetPaged(String urlString, Class<P> pageClazz, Class<T> clazz, Map<String, String> queryParams) throws WildfireFireweatherServiceException {
		GenericRestDAO<P> dao = this.getRestDAOFactory().getGenericRestDAO(pageClazz);
		try {
			List<T> stations = null;
			String method = "GET";
			String eTag = null;
			Object resource = null;
			MultipartData[] files = null;
			Map<String,String> headerParams = null; 
			MultiValuedMap<String,String> fullQueryParams = new ArrayListValuedHashMap<>(queryParams);
			fullQueryParams.put("size", Integer.toString(PAGE_SIZE));
			
			Response<P> response = null;
			for(int i = 0; 
					response==null || !response.getResource().isLast(); 
					i++) {
				fullQueryParams.remove("page");
				fullQueryParams.put("page", Integer.toString(i));
				response = dao.Process(getTransformer(), urlString, method, eTag, resource, files, headerParams, fullQueryParams, getRestTemplate());
				if (stations==null) {
					stations = new ArrayList<>(response.getResource().getTotal());
				}
				stations.addAll(response.getResource().getItems());
			}
			return stations;
			
		} catch (RestDAOException e) {
			throw new WildfireFireweatherServiceException(e);
		} 
	}
	
	private Collection<WeatherStationResource> doGetAllWeatherStations()
			throws WildfireFireweatherServiceException {

		try {
			
			URI topLevelRestURL = new URI(getTopLevelRestURL());
			String urlString = topLevelRestURL.resolve(STATIONS_PATH).resolve("rsql").toString();
			Map<String,String> queryParams = new HashMap<>();
			queryParams.put("query", "stationStatus.id=='ACTIVE'");
			
			return doGetPaged(urlString, WeatherStationPage.class, WeatherStationResource.class, queryParams).stream()
					// Set the geographic geometry from lat and lon
					.map(station->{
							station.setGeometry(GeometryConverters.latLon(station.getLatitude(), station.getLongitude())); 
							return station;
						})
					// Set the projected geometry for distance calculations
					.map(station->{
							try {
								station.setAlbersGeometry(GeometryConverters.geographicToProjected(station.getGeometry()));
							} catch (TransformException e) {
								logger.error(String.format("Error while transforming coordinates %s for station %s", station.getGeometry(), station.getDisplayLabel()), e);
							} 
							return station;
						})
					.collect(Collectors.toList());
			
		} catch (URISyntaxException e) {
			throw new WildfireFireweatherServiceException(e);
		}
	}
	
	Collection<WeatherStationResource> stationCache;
	long stationCacheLastRefreshed;
	
	@Override
	public Collection<WeatherStationResource> getAllWeatherStations()
			throws WildfireFireweatherServiceException {
		if(stationCache==null || stationCacheLastRefreshed+STATION_CACHE_MAX_AGE<clock.millis()) {
			stationCache=doGetAllWeatherStations();
			stationCacheLastRefreshed=clock.millis();
		}
		return Collections.unmodifiableCollection(stationCache);
	}
	
	@Override
	public Collection<WeatherStationResource> getNearbyWeatherStations(final Point p, final double distance)
			throws WildfireFireweatherServiceException {
		final Point albersPoint = ensureAlbers(p);
		return getAllWeatherStations().stream()
		    .filter(station->station.getAlbersGeometry()!=null)
			.filter(station->station.getAlbersGeometry().isWithinDistance(albersPoint, distance))
			.collect(Collectors.toList());
	}
	
	@Override
	public WeatherStationResource getNearestWeatherStation(final Point p)
			throws WildfireFireweatherServiceException {
		final Point albersPoint = ensureAlbers(p);
		return getAllWeatherStations().stream()
		    .filter(station->station.getAlbersGeometry()!=null)
		    .min((station1, station2)->
		        (int)Math.signum(station1.getAlbersGeometry().distance(albersPoint)-station2.getAlbersGeometry().distance(albersPoint)))
		    .orElseThrow(()->new WildfireFireweatherServiceException("Could not find a nearest weather station"));
	}
	
	@Override
	public Optional<WeatherStationResource> getNearestWeatherStationWithin(final Point p, final double distance)
			throws WildfireFireweatherServiceException {
		final Point albersPoint = ensureAlbers(p);
		return getAllWeatherStations().stream()
		    .filter(station->station.getAlbersGeometry()!=null)
			.filter(station->station.getAlbersGeometry().isWithinDistance(albersPoint, distance))
		    .min((station1, station2)->
		        (int)Math.signum(station1.getAlbersGeometry().distance(albersPoint)-station2.getAlbersGeometry().distance(albersPoint)));
	}

	private Point ensureAlbers(final Point p) throws WildfireFireweatherServiceException {
		final Point albersPoint;
		if(p.getSRID()==4269) {
			try {
				albersPoint = GeometryConverters.geographicToProjected(p);
			} catch (TransformException e) {
				throw new WildfireFireweatherServiceException("Error while reprojecting", e);
			}
		} else {
			albersPoint=p;
		}
		return albersPoint;
	}

	@Override
	public List<Weather> getHourlies(String stationId, Long start, Long end)
			throws WildfireFireweatherServiceException {
		
		try {
			
			URI topLevelRestURL = new URI(getTopLevelRestURL());
			String urlString = topLevelRestURL.resolve(HOURLIES_PATH).resolve(HOURLIES_SEARCH_PATH).toString();
			Map<String,String> queryParams = new HashMap<>();
			
			queryParams.put("stationId", stationId);
			if(start!=null)
				queryParams.put("startTimestamp", Long.toString(start));
			if(end!=null)
				queryParams.put("endTimestamp", Long.toString(end));
			queryParams.put("size", Integer.toString(PAGE_SIZE));
			
			return doGetPaged(urlString, HourliesPage.class, Weather.class, queryParams);
			
			
		} catch (URISyntaxException e) {
			throw new WildfireFireweatherServiceException(e);
		}
	}


	@Override
	public List<Weather> getHourlies(String stationId, TemporalAmount period)
			throws WildfireFireweatherServiceException {
		Instant now = clock.instant();
		Instant start = now.minus(period);
		return getHourlies(stationId, start.toEpochMilli(), now.toEpochMilli());
	}
	
	@Override
	public List<DailyWeather> getDailies(String stationId, TemporalAmount period)
			throws WildfireFireweatherServiceException {
		Instant now = clock.instant();
		Instant start = now.minus(period);
		return getDailies(stationId, start.toEpochMilli(), now.toEpochMilli());
	}
	
	@Override
	public List<DailyWeather> getDailies(String stationId, Long start, Long end)
			throws WildfireFireweatherServiceException {
		
		try {
			
			URI topLevelRestURL = new URI(getTopLevelRestURL());
			String urlString = topLevelRestURL.resolve(DAILIES_PATH).resolve(DAILIES_SEARCH_PATH).toString();
			Map<String,String> queryParams = new HashMap<>();

			queryParams.put("stationId", stationId);
			
			if(start!=null)
				queryParams.put("midNightTimestamp", Long.toString(start));
			if(end!=null)
				queryParams.put("currentTimestamp", Long.toString(end));
			queryParams.put("size", Integer.toString(PAGE_SIZE));
			
			return doGetPaged(urlString, DailiesPage.class, DailyWeather.class, queryParams);
			
			
		} catch (URISyntaxException e) {
			throw new WildfireFireweatherServiceException(e);
		}
	}
	
	

}
