package ca.bc.gov.mof.wfpointid.rest.endpoint;

import java.io.File;
import java.util.Objects;

import jakarta.servlet.http.HttpServletRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
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
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@Tag(name = "PointId")
public class PointIdEndpoints {
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
	@Operation(summary = "Get list of features that are near by the provided coordinates", description = "Get list of features that are near by the provided coordinates.", extensions = {
			@Extension(properties = { @ExtensionProperty(name = "auth-type", value = "None"),
					@ExtensionProperty(name = "throttling-tier", value = "Unlimited") }) })
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "400", description = "Bad Request"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error") })
	@GetMapping("/nearby")
	public NearbyResource getNearby(
			@io.swagger.v3.oas.annotations.Parameter(description = "The longitude of the point used to calculate.") @RequestParam String lat,
			@io.swagger.v3.oas.annotations.Parameter(description = "The latitude of the point used to calculate.") @RequestParam String lon,
			@io.swagger.v3.oas.annotations.Parameter(description = "The radius used to calculate what is near by.") @RequestParam(required = false) String radius)
			throws ParameterException, ServiceBusyException, ServiceErrorException {
		LOG.debug("controller=" + this);
		LOG.debug("nearbyService=" + nearbyService);

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
				Runtime.getRuntime().freeMemory() / 1048576);

		/* This will return Long.MAX_VALUE if there is no preset limit */
		long maxMemory = Runtime.getRuntime().maxMemory();
		/* Maximum amount of memory the JVM will attempt to use */
		System.out.println("Maximum memory (MB): " +
				(maxMemory == Long.MAX_VALUE ? "no limit" : Long.valueOf(maxMemory / 1048576)));

		/* Total memory currently in use by the JVM */
		System.out.println("Total memory (MB): " +
				Runtime.getRuntime().totalMemory() / 1048576);

		/* Get a list of all filesystem roots on this system */
		File[] roots = File.listRoots();

		/* For each filesystem root, print some info */
		for (File root : roots) {
			System.out.println("File system root: " + root.getAbsolutePath());
			System.out.println("Total space (MB): " + root.getTotalSpace() / 1048576);
			System.out.println("Free space (MB): " + root.getFreeSpace() / 1048576);
			System.out.println("Usable space (MB): " + root.getUsableSpace() / 1048576);
		}
	}

	static final int DAY_LENGTH = 24;
	static final int MAX_DAYS = 3;
	static final int MAX_HOURS = MAX_DAYS * DAY_LENGTH;

	Durations getDurations(String durationHours, String durationDays, String duration) throws ParameterException {
		Durations result = new Durations();

		// Defaults
		result.hours = 10;
		result.days = 2;

		if (Objects.nonNull(duration)) {
			result.days = (int) Parameter.integer("duration", duration).checkRange(0, MAX_DAYS).get();
			result.hours = result.days * DAY_LENGTH;
		}
		if (Objects.nonNull(durationDays)) {
			result.days = (int) Parameter.integer("durationDays", durationDays).checkRange(0, MAX_DAYS).get();
		}
		if (Objects.nonNull(durationHours)) {
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
	@Operation(summary = "Get list of weather events that are near by the provided coordinates", description = "Get list of weather events that are near by the provided coordinates.", extensions = {
			@Extension(properties = { @ExtensionProperty(name = "auth-type", value = "None"),
					@ExtensionProperty(name = "throttling-tier", value = "Unlimited") }) })
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "400", description = "Bad Request"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error") })
	@GetMapping("/weather")
	public WeatherResource getWeatherData(
			@io.swagger.v3.oas.annotations.Parameter(description = "The longitude of the point used to calculate.") @RequestParam String lat,
			@io.swagger.v3.oas.annotations.Parameter(description = "The latitude of the point used to calculate.") @RequestParam String lon,
			@io.swagger.v3.oas.annotations.Parameter(description = "The hour of day used to filter weather events, default now.") @RequestParam(value = "hour", required = false) String hourstamp,
			@io.swagger.v3.oas.annotations.Parameter(description = "Duration to fetch hourly records in hours.") @RequestParam(required = false) String durationHours,
			@io.swagger.v3.oas.annotations.Parameter(description = "Duration to fetch daily records in days.") @RequestParam(required = false) String durationDays,
			@io.swagger.v3.oas.annotations.Parameter(description = "Duration to fetch both hourly and daily records in days. Replaces durationHours and durationDays") @RequestParam(required = false) String duration)
			throws ParameterException, ServiceErrorException {

		WeatherService service = serviceContext.getWeatherService();
		if (service == null) {

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
	@Operation(summary = "Get list of weather events for a particular weather station", description = "Get list of weather events that are near by the provided coordinates.", extensions = {
			@Extension(properties = { @ExtensionProperty(name = "auth-type", value = "None"),
					@ExtensionProperty(name = "throttling-tier", value = "Unlimited") }) })
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "400", description = "Bad Request"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error") })
	@GetMapping("/weatherStation")
	@Cacheable(value = "weatherStationData", unless = "#result == null", key = "{#code, #hourstamp, #durationHours, #durationDays, #duration}")
	public WeatherResource getWeatherStationData(
			@io.swagger.v3.oas.annotations.Parameter(description = "The station ID code.") @RequestParam String code,
			@io.swagger.v3.oas.annotations.Parameter(description = "The hour of day used to filter weather events, default now.") @RequestParam(value = "hour", required = false) String hourstamp,
			@io.swagger.v3.oas.annotations.Parameter(description = "Duration to fetch hourly records in hours.") @RequestParam(required = false) String durationHours,
			@io.swagger.v3.oas.annotations.Parameter(description = "Duration to fetch daily records in days.") @RequestParam(required = false) String durationDays,
			@io.swagger.v3.oas.annotations.Parameter(description = "Duration to fetch both hourly and daily records in days. Replaces durationHours and durationDays") @RequestParam(required = false) String duration)
			throws ParameterException, ServiceErrorException {

		WeatherService service = serviceContext.getWeatherService();
		if (service == null) {

			throw new RuntimeException("Service not found");
		}

		Integer parsedCode = (int) Parameter.integer("code", code)
				.checkRange(0, Integer.MAX_VALUE)
				.get();
		if (Objects.nonNull(hourstamp)) {
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
	@Operation(summary = "Get list of owned features that are near by the provided coordinates", description = "Get list of owned features that are near by the provided coordinates.", extensions = {
			@Extension(properties = { @ExtensionProperty(name = "auth-type", value = "None"),
					@ExtensionProperty(name = "throttling-tier", value = "Unlimited") }) })
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "400", description = "Bad Request"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error") })
	@GetMapping("/ownership")
	public OwnershipResource getOwnershipData(
			@io.swagger.v3.oas.annotations.Parameter(description = "The longitude of the point used to calculate.") @RequestParam String lat,
			@io.swagger.v3.oas.annotations.Parameter(description = "The latitude of the point used to calculate.") @RequestParam String lon)
			throws ParameterException, ServiceBusyException {

		IdentifyService service = serviceContext.getIdentifyService();
		if (service == null) {

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
	@Operation(summary = "Get list of geography features that are near by the provided coordinates", description = "Get list of geography features that are near by the provided coordinates.", extensions = {
			@Extension(properties = { @ExtensionProperty(name = "auth-type", value = "None"),
					@ExtensionProperty(name = "throttling-tier", value = "Unlimited") }) })
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200", description = "OK"),
			@ApiResponse(responseCode = "400", description = "Bad Request"),
			@ApiResponse(responseCode = "500", description = "Internal Server Error") })
	@GetMapping("/geography")
	public GeographyResource getGeographyData(
			@io.swagger.v3.oas.annotations.Parameter(description = "The longitude of the point used to calculate.") @RequestParam String lat,
			@io.swagger.v3.oas.annotations.Parameter(description = "The latitude of the point used to calculate.") @RequestParam String lon)
			throws ParameterException, ServiceBusyException {

		IdentifyService service = serviceContext.getIdentifyService();
		if (service == null) {

			throw new NotFoundException();
		}

		checkParametersLonLat(lon, lat);

		return service.queryGeography(lon, lat);
	}

	private static void checkParametersLonLat(String lon, String lat)
			throws ParameterException {
		Parameter.number("lon", lon).checkRange(-180, 0);
		Parameter.number("lat", lat).checkRange(0, 90);
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
		return new ResponseEntity<ErrorResource>(error, HttpStatus.TOO_MANY_REQUESTS);
	}

	@ExceptionHandler(Throwable.class)
	public ResponseEntity<ErrorResource> handleError(
			HttpServletRequest req, Throwable e) {
		LOG.error("Internal error", e);
		if (isClientGoneHack(e)) {
			// this avoids having this handler throw
			return null;
		}
		ErrorResource error = ErrorResource.createWithDetails(Messages.ERROR_INTERNAL, e);
		return new ResponseEntity<ErrorResource>(error, HttpStatus.INTERNAL_SERVER_ERROR);
	}

	public static String logStack(String msg, Throwable e) {
		return msg + " : " + e.getMessage();
	}

	static final String CATALINA_CLIENT_ABORT = "An existing connection was forcibly closed by the remote host";

	static boolean isClientGoneHack(Throwable e) {
		if (e.getClass().getCanonicalName().contains("ClientAbortException"))
			return true;

		String msg = e.getMessage();
		if (msg == null)
			return false;

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
