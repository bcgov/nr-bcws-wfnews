package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.metrics;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Writes CloudWatch Embedded Metric Format lines. CloudWatch Logs reads them out of the log
 * group, so the send path makes no CloudWatch API call. The line must be the JSON and nothing
 * else, so it uses its own log4j2 logger with a bare %m%n layout.
 */
public final class EmfMetrics {

	/** Configured in log4j2.xml with a bare layout and no additivity. */
	public static final String LOGGER_NAME = "WFNEWS_EMF_METRICS";

	private static final String NAMESPACE = "WFNEWS/PushNotifications";
	private static final String MONITOR_TYPE_DIMENSION = "MonitorType";

	private static final Logger logger = LoggerFactory.getLogger(LOGGER_NAME);

	public static final String COUNT = "Count";
	public static final String COUNT_PER_SECOND = "Count/Second";
	public static final String MILLISECONDS = "Milliseconds";

	private final Map<String, String> dimensions = new LinkedHashMap<>();
	private final Map<String, String> units = new LinkedHashMap<>();
	private final Map<String, Number> values = new LinkedHashMap<>();

	private EmfMetrics(String monitorType) {
		this.dimensions.put(MONITOR_TYPE_DIMENSION, monitorType);
	}

	/** One line of metrics for one monitor type. */
	public static EmfMetrics forMonitorType(String monitorType) {
		return new EmfMetrics(monitorType);
	}

	public EmfMetrics dimension(String name, String value) {
		this.dimensions.put(name, value);
		return this;
	}

	public EmfMetrics metric(String name, String unit, Number value) {
		this.units.put(name, unit);
		this.values.put(name, value);
		return this;
	}

	/** Never throws: a failure here would put the event back on the queue. */
	public void emit() {
		try {
			if (this.values.isEmpty()) {
				return;
			}

			JSONArray metrics = new JSONArray();
			this.units.forEach((name, unit) -> metrics.put(new JSONObject().put("Name", name).put("Unit", unit)));

			JSONObject directive = new JSONObject()
					.put("Namespace", NAMESPACE)
					.put("Dimensions", new JSONArray().put(new JSONArray(this.dimensions.keySet())))
					.put("Metrics", metrics);

			JSONObject line = new JSONObject()
					.put("_aws", new JSONObject()
							.put("Timestamp", System.currentTimeMillis())
							.put("CloudWatchMetrics", new JSONArray().put(directive)));

			this.dimensions.forEach(line::put);
			this.values.forEach(line::put);

			logger.info(line.toString());
		} catch (RuntimeException e) {
			// The metrics logger is not the application log, so say it in the application log.
			LoggerFactory.getLogger(EmfMetrics.class).warn("Failed to write a metric line", e);
		}
	}
}
