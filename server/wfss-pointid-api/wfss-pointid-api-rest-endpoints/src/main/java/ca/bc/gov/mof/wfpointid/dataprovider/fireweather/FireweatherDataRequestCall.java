package ca.bc.gov.mof.wfpointid.dataprovider.fireweather;

import java.time.Period;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.locationtech.jts.geom.Point;

import ca.bc.gov.mof.wfpointid.dataprovider.DataItemDef;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequest;
import ca.bc.gov.mof.wfpointid.dataprovider.DataRequestCall;
import ca.bc.gov.mof.wfpointid.dataprovider.DataResult;
import ca.bc.gov.mof.wfpointid.fireweather.rest.client.v1.WildfireFireweatherServiceException;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.Weather;
import ca.bc.gov.mof.wfpointid.fireweather.rest.v1.resource.WeatherStationResource;
import ca.bc.gov.mof.wfpointid.rest.client.GeometryConverters;
import ca.bc.gov.mof.wfpointid.rest.model.DistantWeatherStation;
import ca.bc.gov.mof.wfpointid.rest.model.PositionedWeatherStation;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherBase;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherHourly;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherStation;
import ca.bc.gov.mof.wfpointid.weather.FireweatherWeatherService;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherDistance;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherHour;

public class FireweatherDataRequestCall implements DataRequestCall {

	private static Logger LOG = LoggerFactory.getLogger(FireweatherDataRequestCall.class);

	private FireweatherDataProvider provider;

	FireweatherDataRequestCall(FireweatherDataProvider dataProvider) {
		this.provider = dataProvider;
	}

	static final Map<String, Function<WeatherStation, ?>> STATION_ACCESSORS = new HashMap<>(); 
	static final Map<String, Function<WeatherBase, ?>> HOURLY_ACCESSORS = new HashMap<>(); 
	
	static {
		
		STATION_ACCESSORS.put("stationCode", WeatherStation::getStationCode);
		STATION_ACCESSORS.put("stationName", WeatherStation::getStationName);
		STATION_ACCESSORS.put("elevation", WeatherStation::getElevation);
		STATION_ACCESSORS.put("distance", station->((DistantWeatherStation) station).getDistance());
		STATION_ACCESSORS.put("lat", station->((PositionedWeatherStation) station).getLat());
		STATION_ACCESSORS.put("lon", station->((PositionedWeatherStation) station).getLon());
		
		HOURLY_ACCESSORS.put("relativeHumidity", WeatherBase::getRelativeHumidity);
		HOURLY_ACCESSORS.put("windSpeed", WeatherBase::getWindSpeed);
		HOURLY_ACCESSORS.put("windDirection", WeatherBase::getWindDirection);
		HOURLY_ACCESSORS.put("windCardinalDir", WeatherBase::getWindCardinalDir);
		HOURLY_ACCESSORS.put("precipitation", WeatherBase::getPrecipitation);
		HOURLY_ACCESSORS.put("fineFuelMoistureCode", WeatherBase::getFineFuelMoistureCode);
		HOURLY_ACCESSORS.put("initialSpreadIndex", WeatherBase::getInitialSpreadIndex);
		HOURLY_ACCESSORS.put("fireWeatherIndex", WeatherBase::getFireWeatherIndex);
		HOURLY_ACCESSORS.put("hour", report->((WeatherHourly)report).getHour());
	}
	
	@Override
	public DataResult perform(DataRequest req) throws Exception {
		Point p = GeometryConverters.latLon(req.getQueryPt().getLat(), req.getQueryPt().getLon());
		double radius = req.getRadius()*1000; // Given in km, need m.
		
		try {
			Optional<WeatherStationResource> opt = provider.getService().getNearestWeatherStationWithin(p, radius);
			if(opt.isPresent()) {
				WeatherStationResource from = opt.get();
			    WeatherStation station = WeatherDistance.obfuscateLocation(req.getQueryPt(), FireweatherWeatherService.convertStation(from));
			    List<Weather> hourlies = provider.getService().getHourlies(from.getId().toString(), Period.ofDays(2));
			    station.setHourly(FireweatherWeatherService.convertHourlies(hourlies, WeatherHour.now()));
			    Optional<WeatherHourly> currentWeather = Arrays.stream(station.getHourly())
					.sorted((h1,h2)->-1*h1.getHour().compareTo(h2.getHour()))
					.findFirst();
			    
				DataResult result = DataResult.createValue(req.getDataRequestDef(), station);
				
				result.setMappedValues(Collections.singletonList(Arrays.asList(req.getDataRequestDef().getItems()).stream()
					.collect(Collectors.toMap(
							DataItemDef::getName, 
							def->{
								if(def.getAttributeName().startsWith("currentWeather.")) {
									Function<WeatherBase, ?> accessor = Optional.ofNullable(HOURLY_ACCESSORS.get(def.getAttributeName().substring(15)))
										.orElseThrow(()->new IllegalArgumentException(String.format("Invalid attribute %s",def.getAttributeName())));
									return currentWeather.map(accessor).map(Object::toString).orElse("");
								} else {
									Function<WeatherStation, ?> accessor = Optional.ofNullable(STATION_ACCESSORS.get(def.getAttributeName()))
										.orElseThrow(()->new IllegalArgumentException(String.format("Invalid attribute %s",def.getAttributeName())));
									return accessor.apply(station).toString();
								}
							} ))));

				return result;
			} else {
				return DataResult.createNoData(req.getDataRequestDef());
			}
		} catch (WildfireFireweatherServiceException ex) {
			LOG.warn(String.format("Error while getting station near %s", p.toText()), ex);
			return DataResult.createError(req.getDataRequestDef(), String.format("Error while getting station: %s", ex.getMessage()));
		}

	}

}
