package ca.bc.gov.mof.wfpointid.rest.endpoint;

import java.io.File;
import java.util.Objects;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ca.bc.gov.mof.wfpointid.Messages;
import ca.bc.gov.mof.wfpointid.PointIdServiceParams;
import ca.bc.gov.mof.wfpointid.ServiceBusyException;
import ca.bc.gov.mof.wfpointid.ServiceContext;
import ca.bc.gov.mof.wfpointid.ServiceErrorException;
import ca.bc.gov.mof.wfpointid.identify.IdentifyService;
import ca.bc.gov.mof.wfpointid.nearby.NearbyService;
import ca.bc.gov.mof.wfpointid.query.QueryPt;
import ca.bc.gov.mof.wfpointid.rest.model.ErrorResource;
import ca.bc.gov.mof.wfpointid.rest.model.GeographyResource;
import ca.bc.gov.mof.wfpointid.rest.model.NearbyResource;
import ca.bc.gov.mof.wfpointid.rest.model.OwnershipResource;
import ca.bc.gov.mof.wfpointid.rest.model.WeatherResource;
import ca.bc.gov.mof.wfpointid.rest.validate.Parameter;
import ca.bc.gov.mof.wfpointid.rest.validate.ParameterException;
import ca.bc.gov.mof.wfpointid.util.GeoUtil;
import ca.bc.gov.mof.wfpointid.weather.WeatherService;
import ca.bc.gov.mof.wfpointid.weather.util.WeatherHour;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import io.swagger.annotations.Extension;
import io.swagger.annotations.ExtensionProperty;

@RestController
@Api(value = "PointId")
public class PointIdEndpoints 
{
	private static Logger LOG = LoggerFactory.getLogger(PointIdEndpoints.class);
	
	@Autowired
	ServiceContext serviceContext;
	
	@Autowired
	PointIdServiceParams param;
	
	@Autowired
	NearbyService nearbyService;

	/**
	 * 
	 * @param lat
	 * @param lon
	 * @param radius
	 * @return
	 * @throws ParameterException 
	 * @throws ServiceErrorException 
	 */
	@ApiOperation(value = "Get list of features that are near by the provided coordinates", response = NearbyResource.class, notes = "Get list of features that are near by the provided coordinates.", extensions = {@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "None"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", response = NearbyResource.class),
		@ApiResponse(code = 400, message = "Bad Request", response = Messages.class),
		@ApiResponse(code = 500, message = "Internal Server Error", response = Messages.class) })
	@RequestMapping(value = "/nearby", method = RequestMethod.GET)
	public NearbyResource getNearby(
			@ApiParam("The longitude of the point used to calculate.") @RequestParam("lat") String lat, 
			@ApiParam("The latitude of the point used to calculate.") @RequestParam("lon") String lon, 
			@ApiParam("The radius used to calculate what is near by.") @RequestParam(value = "radius", required = false) String radius) throws ParameterException, ServiceBusyException, ServiceErrorException  
	{
		LOG.debug("controller="+this);
		LOG.debug("nearbyService="+nearbyService);
		
		checkParametersLonLat(lon, lat);
		if (radius != null) {
			Parameter.number("radius", radius).checkRange(0, Integer.parseInt(param.getMaxAllowedRadius()));
		}
		
		boolean useBufferedPoint = true;
		
		return nearbyService.queryNearbyData(lon, lat, radius, useBufferedPoint);
	}
	
	protected static void logMem() {
		  /* Total number of processors or cores available to the JVM */
		  System.out.println("Available processors (cores): " + 
		  Runtime.getRuntime().availableProcessors());

		  /* Total amount of free memory available to the JVM */
		  System.out.println("Free memory (MB): " + 
		  Runtime.getRuntime().freeMemory()/1048576);

		  /* This will return Long.MAX_VALUE if there is no preset limit */
		  long maxMemory = Runtime.getRuntime().maxMemory();
		  /* Maximum amount of memory the JVM will attempt to use */
		  System.out.println("Maximum memory (MB): " + 
		  (maxMemory == Long.MAX_VALUE ? "no limit" : Long.valueOf(maxMemory/1048576)));

		  /* Total memory currently in use by the JVM */
		  System.out.println("Total memory (MB): " + 
		  Runtime.getRuntime().totalMemory()/1048576);

		  /* Get a list of all filesystem roots on this system */
		  File[] roots = File.listRoots();

		  /* For each filesystem root, print some info */
		  for (File root : roots) {
		    System.out.println("File system root: " + root.getAbsolutePath());
		    System.out.println("Total space (MB): " + root.getTotalSpace()/1048576);
		    System.out.println("Free space (MB): " + root.getFreeSpace()/1048576);
		    System.out.println("Usable space (MB): " + root.getUsableSpace()/1048576);
		  }
	}
	static final int DAY_LENGTH = 24;
	static final int MAX_DAYS = 3;
	static final int MAX_HOURS = MAX_DAYS*DAY_LENGTH;
	
	Durations getDurations(String durationHours, String durationDays, String duration) throws ParameterException {
		Durations result = new Durations();

		// Defaults
		result.hours = 10;
		result.days = 2;

		if(Objects.nonNull(duration)) {
			result.days = (int) Parameter.integer("duration", duration).checkRange(0, MAX_DAYS).get();
			result.hours = result.days*DAY_LENGTH;
		}
		if(Objects.nonNull(durationDays)) {
			result.days = (int) Parameter.integer("durationDays", durationDays).checkRange(0, MAX_DAYS).get();
		}
		if(Objects.nonNull(durationHours)) {
			result.hours = (int) Parameter.integer("durationHours", durationHours).checkRange(0, MAX_HOURS).get();
		}
		return result;
	}
	
	/**
	 * 
	 * @param lat
	 * @param lon
	 * @return
	 * @throws ParameterException 
	 * @throws ServiceErrorException 
	 */
	@ApiOperation(value = "Get list of weather events that are near by the provided coordinates", response = WeatherResource.class, notes = "Get list of weather events that are near by the provided coordinates.", extensions = {@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "None"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", response = WeatherResource.class),
		@ApiResponse(code = 400, message = "Bad Request", response = Messages.class),
		@ApiResponse(code = 500, message = "Internal Server Error", response = Messages.class) })
	@RequestMapping(value = "/weather", method = RequestMethod.GET)
	public WeatherResource getWeatherData(
			@ApiParam("The longitude of the point used to calculate.") @RequestParam("lat") String lat, 
			@ApiParam("The latitude of the point used to calculate.") @RequestParam("lon") String lon, 
			@ApiParam("The hour of day used to filter weather events, default now.") @RequestParam(value = "hour", required = false) String hourstamp, 
			@ApiParam("Duration to fetch hourly records in hours.") @RequestParam(value = "durationHours", required = false) String durationHours,
			@ApiParam("Duration to fetch daily records in days.") @RequestParam(value = "durationDays", required = false) String durationDays,
			@ApiParam("Duration to fetch both hourly and daily records in days. Replaces durationHours and durationDays") @RequestParam(value = "duration", required = false) String duration) throws ParameterException, ServiceErrorException 
	{
		
		WeatherService service = serviceContext.getWeatherService();
		if(service==null) {
			
			throw new NotFoundException();
		}
		
		checkParametersLonLat(lon, lat);
		if (Objects.nonNull(hourstamp)) {
			Parameter.string("hour", hourstamp)
				.checkMatches(WeatherHour.REGEX_HOUR)
				.checkValid(WeatherHour.isValid(hourstamp));
		}
		Durations durations = getDurations(durationHours, durationDays, duration);
		
		QueryPt pt = QueryPt.create(GeoUtil.parseLonLat(lon, lat));
		return service.queryWeatherData(pt, hourstamp, durations.hours, durations.days);
	}
	
	/**
	 * 
	 * @param lat
	 * @param lon
	 * @return
	 * @throws ParameterException 
	 * @throws ServiceErrorException 
	 */
	@ApiOperation(value = "Get list of weather events for a particular weather station", response = WeatherResource.class, notes = "Get list of weather events that are near by the provided coordinates.", extensions = {@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "None"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", response = WeatherResource.class),
		@ApiResponse(code = 400, message = "Bad Request", response = Messages.class),
		@ApiResponse(code = 500, message = "Internal Server Error", response = Messages.class) })
	@RequestMapping(value = "/weatherStation", method = RequestMethod.GET)
	@Cacheable(value = "weatherStationData", unless = "#result == null", key = "{#code, #hourstamp, #durationHours, #durationDays, #duration}")
	public WeatherResource getWeatherStationData(
			@ApiParam("The station ID code.") @RequestParam("code") String code, 
			@ApiParam("The hour of day used to filter weather events, default now.") @RequestParam(value = "hour", required = false) String hourstamp, 
			@ApiParam("Duration to fetch hourly records in hours.") @RequestParam(value = "durationHours", required = false) String durationHours,
			@ApiParam("Duration to fetch daily records in days.") @RequestParam(value = "durationDays", required = false) String durationDays,
			@ApiParam("Duration to fetch both hourly and daily records in days. Replaces durationHours and durationDays") @RequestParam(value = "duration", required = false) String duration) throws ParameterException, ServiceErrorException 
	{
		
		WeatherService service = serviceContext.getWeatherService();
		if(service==null) {
			
			throw new NotFoundException();
		}
		
		Integer parsedCode = (int) Parameter.integer("code", code)
			.checkRange(0, Integer.MAX_VALUE)
			.get();
		if(Objects.nonNull(hourstamp)) {
			Parameter.string("hour", hourstamp)
				.checkMatches(WeatherHour.REGEX_HOUR)
				.checkValid(WeatherHour.isValid(hourstamp));
		}
		Durations durations = getDurations(durationHours, durationDays, duration);
		
		return service.queryWeatherStationData(parsedCode, hourstamp, durations.hours, durations.days);
	}

	/**
	 * 
	 * @param lat
	 * @param lon
	 * @return
	 * @throws ParameterException 
	 * @throws ServiceBusyException 
	 */
	@ApiOperation(value = "Get list of owned features that are near by the provided coordinates", response = OwnershipResource.class, notes = "Get list of owned features that are near by the provided coordinates.", extensions = {@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "None"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", response = OwnershipResource.class),
		@ApiResponse(code = 400, message = "Bad Request", response = Messages.class),
		@ApiResponse(code = 500, message = "Internal Server Error", response = Messages.class) })
	@RequestMapping(value = "/ownership", method = RequestMethod.GET)
	public OwnershipResource getOwnershipData(
			@ApiParam("The longitude of the point used to calculate.") @RequestParam("lat") String lat, 
			@ApiParam("The latitude of the point used to calculate.") @RequestParam("lon") String lon) throws ParameterException, ServiceBusyException 
	{
		
		IdentifyService service = serviceContext.getIdentifyService();
		if(service==null) {
			
			throw new NotFoundException();
		}
	
		checkParametersLonLat(lon, lat);
		
		return service.queryOwnership(lon, lat);
	}

	/**
	 * 
	 * @param lat
	 * @param lon
	 * @return
	 * @throws ParameterException 
	 * @throws ServiceBusyException 
	 */
	@ApiOperation(value = "Get list of geography features that are near by the provided coordinates", response = GeographyResource.class, notes = "Get list of geography features that are near by the provided coordinates.", extensions = {@Extension(properties = {@ExtensionProperty(name = "auth-type", value = "None"), @ExtensionProperty(name = "throttling-tier", value = "Unlimited") })})
	@ApiResponses(value = {
		@ApiResponse(code = 200, message = "OK", response = GeographyResource.class),
		@ApiResponse(code = 400, message = "Bad Request", response = Messages.class),
		@ApiResponse(code = 500, message = "Internal Server Error", response = Messages.class) })
	@RequestMapping(value = "/geography", method = RequestMethod.GET)
	public GeographyResource getGeographyData(
			@ApiParam("The longitude of the point used to calculate.") @RequestParam("lat") String lat, 
			@ApiParam("The latitude of the point used to calculate.") @RequestParam("lon") String lon) throws ParameterException, ServiceBusyException 
	{
		
		IdentifyService service = serviceContext.getIdentifyService();
		if(service==null) {
			
			throw new NotFoundException();
		}
		
		checkParametersLonLat(lon, lat);
		
		return service.queryGeography(lon, lat);
	}

	private static void checkParametersLonLat(String lon, String lat)
			throws ParameterException {
		Parameter.number("lon", lon).checkRange(-180,  0);
		Parameter.number("lat", lat).checkRange(0,  90);
	}

	@ExceptionHandler(ParameterException.class)
	public ResponseEntity<ErrorResource> handleParameterError(
			HttpServletRequest req, Exception e) {
		ErrorResource error = ErrorResource.create(e);
		LOG.debug(error.getErrorMsg());
		return new ResponseEntity<ErrorResource>(error,
				HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(ServiceErrorException.class)
	public ResponseEntity<ErrorResource> handleServiceError(
			HttpServletRequest req, Exception e) {
		LOG.error("Service error", e);
		ErrorResource error = ErrorResource.createWithDetails(e);
		return new ResponseEntity<ErrorResource>(error,
				HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@ExceptionHandler(ServiceBusyException.class)
	public ResponseEntity<ErrorResource> handleServiceBusy(
			HttpServletRequest req, Exception e) {
		// log at debug level only, since this is not a server error
		LOG.debug("Service busy", e);
		ErrorResource error = ErrorResource.createWithDetails(e);
		return new ResponseEntity<ErrorResource>(error,	HttpStatus.TOO_MANY_REQUESTS);
	}
	
	@ExceptionHandler(Throwable.class)
	public ResponseEntity<ErrorResource> handleError(
			HttpServletRequest req, Throwable e) {
		LOG.error("Internal error", e);
		if ( isClientGoneHack(e) ) {
			// this avoids having this handler throw
			return null;
		}
		ErrorResource error = ErrorResource.createWithDetails(Messages.ERROR_INTERNAL, e);
		return new ResponseEntity<ErrorResource>(error,	HttpStatus.INTERNAL_SERVER_ERROR);
	}

	public static String logStack(String msg, Throwable e) {
		return msg + " : " + e.getMessage();
	}

	static final String CATALINA_CLIENT_ABORT = "An existing connection was forcibly closed by the remote host";
	
	static boolean isClientGoneHack(Throwable e) {
		if (e.getClass().getCanonicalName().contains("ClientAbortException"))
			return true;
		
		String msg = e.getMessage();
		if (msg == null) return false;
	
		if (msg.contains(CATALINA_CLIENT_ABORT)) {
			// this avoids having this handler throw
			return true;
		}
		return false;
	}

	protected static class Durations {
		public int hours;
		public int days;
	}
}
