package ca.bc.gov.mof.wfpointid.weather;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ca.bc.gov.mof.wfpointid.Messages;
import ca.bc.gov.mof.wfpointid.ServiceErrorException;
import ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.WildfireFireweatherServiceException;
import ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.impl.WildfireFireweatherServiceImpl;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.DailyWeather;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.Weather;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.WeatherStationResource;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.rest.client.GeometryConverters;
import ca.bc.gov.mof.wfpointid.rest.model.PositionedWeatherStation;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherBase;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherDaily;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherHourly;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherResource;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherStation;
import ca.bc.gov.mof.wfpointid.weather.util.TimeRange;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherDay;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherDistance;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherHour;

public class FireweatherWeatherService extends WeatherService {
	
	private static Logger LOG = LoggerFactory.getLogger(FireweatherWeatherService.class);
	private WildfireFireweatherServiceImpl service;
			
	public FireweatherWeatherService(String baseUrl, String webadeOauth2ClientId, String webadeOauth2ClientSecret, String webadeOauth2TokenUrl, String scopes) {

		LOG.info(String.format("Init fireweather client for: %s, user: %s", baseUrl, webadeOauth2ClientId));
		this.service = new WildfireFireweatherServiceImpl(webadeOauth2ClientId, webadeOauth2ClientSecret, webadeOauth2TokenUrl, scopes);
		this.service.setTopLevelRestURL(baseUrl);

	}
	
	@Override
	public WeatherResource queryWeatherData(QueryPt pt, String hourstamp, int hourlyDuration, int dailyDuration) throws ServiceErrorException 
	{
		WeatherStation station;
		try {
			WeatherStationResource resource = service.getNearestWeatherStation(GeometryConverters.latLon(pt.getLat(), pt.getLon()));
			station = WeatherDistance.obfuscateLocation(pt, convertStation(resource));
			
			completeStation(hourstamp, hourlyDuration, dailyDuration, station, resource);
		}
		catch (Exception ex) {
			ex.printStackTrace();
			throw new ServiceErrorException(Messages.ERROR_WEATHER_DATA, ex);
		}
		return createResource(pt, station);
	}

	private void completeStation(String hourstamp, int hourlyDuration, int dailyDuration,
			WeatherStation station, WeatherStationResource resource) throws WildfireFireweatherServiceException {
		boolean useNow = hourstamp == null;
		// use given hour or default to NOW
		if (useNow) {
			hourstamp = WeatherHour.addHours(WeatherHour.now(),-1); // "Now" is the most recent hour to have finished so go back one.
		}
		TimeRange hourliesRange = WeatherHour.range(hourstamp, hourlyDuration);
		LOG.info(String.format("Getting hourlies for station %s (%s) from %d to %d", station.getStationCode(),resource.getId(), hourliesRange.getStartMillis(), hourliesRange.getEndMillis()));
		WeatherHourly[] hrly = convertHourlies(service.getHourlies(resource.getId().toString(), hourliesRange.getStartMillis()+1, hourliesRange.getEndMillis()+1), hourstamp);
		hrly = fillHourlies(hrly, hourliesRange);
		
		station.setHourly(hrly);
		
		TimeRange dailiesRange;
		if (useNow) {
			dailiesRange = WeatherDay.rangeFromHourWithRollover(hourstamp, dailyDuration);
		} else {
			dailiesRange = WeatherDay.rangeFromHour(hourstamp, dailyDuration);
		}

		LOG.info(String.format("Getting dailies for station %s (%s) from %d to %d", station.getStationCode(),resource.getId(), dailiesRange.getStartMillis(), dailiesRange.getEndMillis()));
		WeatherDaily[] daily = convertDailies(service.getDailies(resource.getId().toString(), dailiesRange.getStartMillis(), dailiesRange.getEndMillis()), dailiesRange.getEndStamp());
		daily = fillDailies(daily, dailiesRange);
		
		station.setDaily(daily);
	}

	@Override
	public WeatherResource queryWeatherStationData(int code, String hourstamp, int hourlyDuration, int dailyDuration) throws ServiceErrorException {
		WeatherStation station;
		QueryPt pt;
		try {
			Optional<WeatherStationResource> resource = service.getWeatherStationByCode(code);
			if(resource.isPresent()) {
				station = WeatherDistance.obfuscateLocation(null, convertStation(resource.get()));
				completeStation(hourstamp, hourlyDuration, dailyDuration, station, resource.get());
				pt = null;
			} else {
				return createEmptyResource();
			}
		}
		catch (Exception ex) {
			ex.printStackTrace();
			throw new ServiceErrorException(Messages.ERROR_WEATHER_DATA, ex);
		}
		return createResource(pt, station);
	}

	private WeatherResource createEmptyResource() {
		WeatherResource result = new WeatherResource();
		result.setStations(new WeatherStation[] {});
		return result;
	}

	public static WeatherHourly[] convertHourlies(List<Weather> resource, String endHour) {
		LOG.debug(String.format("Converting %d hourlies", resource.size()));
		return resource.stream().map(from->{
			WeatherHourly weather = convertWeatherBase(new WeatherHourly(), from);
			weather.setHour(WeatherHour.fromMillis(from.getWeatherTimestamp()));
			weather.setIndex(WeatherHour.diffHours(endHour, weather.getHour())+1);
			LOG.debug(String.format("Hourly for %s, index %d", weather.getHour(), weather.getIndex()));
			return weather;
		}).toArray(WeatherHourly[]::new);
	}

	public static WeatherDaily[] convertDailies(List<DailyWeather> resource, String endDay) {
		LOG.debug(String.format("Converting %d dailies before %s", resource.size(), endDay));
		return resource.stream().map(from->{
			WeatherDaily weather = convertWeatherBase(new WeatherDaily(), from);
			weather.setBuildupIndex(from.getBuildUpIndex());
			weather.setDuffMoistureCode(from.getDuffMoistureCode());
			weather.setDroughtCode(from.getDroughtCode());
			weather.setDay(WeatherHour.toDay(WeatherHour.fromMillis(from.getWeatherTimestamp())));
			weather.setIndex(WeatherDay.diffDays(endDay, weather.getDay())+1);
			LOG.debug(String.format("Daily for %s, index %d", weather.getDay(), weather.getIndex()));
			LOG.info("Daily build up index: " + weather.getBuildupIndex()  + " drought code: " + weather.getDroughtCode() + " duff moisture code: "    + weather.getDuffMoistureCode()    );
			return weather;
		}).toArray(WeatherDaily[]::new);
	}

	static  WeatherDaily[] fillDailies(WeatherDaily[] sparse, TimeRange range) {
		LOG.debug(String.format("Filling missing dailies for %s to %s, %d days", range.getStartStamp(), range.getEndStamp(), range.getDuration()));
		WeatherDaily[] result = new WeatherDaily[range.getDuration()];
		for(WeatherDaily report: sparse) {
			LOG.debug(String.format("Placing daily %s at %d-1", report.getDay(), report.getIndex()));
			result[report.getIndex()-1] = report;
		}
		for (int i = 0; i<range.getDuration(); i++) {
			if(Objects.isNull(result[i])) {
				WeatherDaily report = new WeatherDaily();
				report.setDay(WeatherDay.addDays(range.getEndStamp(), -i));
				report.setIndex(i+1);
				result[i] = report;
			}
		}
		return result;
	}
	
	static  WeatherHourly[] fillHourlies(WeatherHourly[] sparse, TimeRange range) {
		LOG.debug(String.format("Filling missing hourlies for %s to %s, %d days", range.getStartStamp(), range.getEndStamp(), range.getDuration()));
		WeatherHourly[] result = new WeatherHourly[range.getDuration()];
		for(WeatherHourly report: sparse) {
			LOG.debug(String.format("Placing hourly %s at %d-1", report.getHour(), report.getIndex()));
			result[report.getIndex()-1] = report;
		}
		for (int i = 0; i<range.getDuration(); i++) {
			if(Objects.isNull(result[i])) {
				WeatherHourly report = new WeatherHourly();
				report.setHour(WeatherHour.addHours(range.getEndStamp(), -i));
				report.setIndex(i+1);
				result[i] = report;
			}
		}
		return result;
	}
	
	private static Integer nullSafeRound(Double value) {
		if(Objects.isNull(value)) {
			return null;
		} else {
			return (int)Math.round(value);
		}
	} 
	
	public static <W extends WeatherBase> W convertWeatherBase(W to, Weather from) {
		to.setFineFuelMoistureCode(from.getFineFuelMoistureCode());
		to.setTemp(from.getTemperature());
		to.setRelativeHumidity(nullSafeRound(from.getRelativeHumidity()));
		to.setWindSpeed(from.getWindSpeed());
		to.setWindDirection(nullSafeRound(from.getWindDirection()));
		to.setPrecipitation(from.getPrecipitation());
		to.setInitialSpreadIndex(from.getInitialSpreadIndex());
		to.setFireWeatherIndex(from.getFireWeatherIndex());
		return to;
	}

	public static PositionedWeatherStation convertStation(WeatherStationResource resource) {
		PositionedWeatherStation station = new PositionedWeatherStation();
		station.setElevation(resource.getElevation());
		station.setLat(resource.getLatitude());
		station.setLon(resource.getLongitude());
		station.setStationCode(resource.getStationCode());
		station.setStationName(resource.getDisplayLabel());
		return station;
	}

}
