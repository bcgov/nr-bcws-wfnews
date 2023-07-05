package ca.bc.gov.nrs.wfone.service.api.v1.validation;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.utils.Base64Coder;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;

import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableListRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeTableRsrc;
import ca.bc.gov.nrs.common.wfone.rest.resource.CodeRsrc;
import ca.bc.gov.nrs.wfone.api.model.v1.Notification;
import ca.bc.gov.nrs.wfone.api.model.v1.NotificationSettings;
import ca.bc.gov.nrs.wfone.api.model.v1.PublicReportOfFire;
import ca.bc.gov.nrs.wfone.common.model.Message;
import ca.bc.gov.nrs.wfone.common.service.api.validation.BaseValidator;
import ca.bc.gov.nrs.wfone.common.utils.MessageBuilder;
import ca.bc.gov.nrs.wfone.service.api.v1.RecordServiceConstants;
import ca.bc.gov.nrs.wfone.service.api.v1.validation.constraints.NotificationConstraints;
import ca.bc.gov.nrs.wfone.service.api.v1.validation.constraints.NotificationSettingsConstraints;
import ca.bc.gov.nrs.wfone.service.api.v1.validation.constraints.PublicReportOfFireConstraints;

public class ModelValidator extends BaseValidator {

	private static final Logger logger = LoggerFactory.getLogger(ModelValidator.class);

	@Value("${webade-oauth2.wfim.client.id}")
	private String webadeOauth2ClientId;

	@Value("${webade-oauth2.wfone_notifictions_api_rest.client.secret}")
	private String webadeOauth2ClientSecret;

	@Value("${webade-oauth2.token.client.url}")
	private String webadeOauth2ClientUrl;

	@Value("${wfim-client.url}")
	private String wfimClientUrl;

	@Value("${wfim-code-tables.url}")
	private String wfimCodeTablesUrl;

	private CodeTableListRsrc codeTables;

	/**
	 * Helper method for loading and initializing code tables from WFIM
	 */
	private void loadCodeTables() {
		try {
			HttpResponse<JsonNode> tokenResponse = Unirest.get(webadeOauth2ClientUrl)
					.header("Authorization",
							"Basic " + Base64Coder.encodeString(webadeOauth2ClientId + ":" + webadeOauth2ClientSecret))
					.header("Content-Type", "application/json").asJson();
			JsonNode tokenBody = tokenResponse.getBody();
			String token = tokenBody.getObject().getString("access_token");

			HttpResponse<String> codeResponse = Unirest.get(wfimCodeTablesUrl)
					.header("Authorization", "Bearer " + token).header("Content-Type", "application/json").asString();

			ObjectMapper mapper = new ObjectMapper();
			codeTables = mapper.readValue(codeResponse.getBody(), CodeTableListRsrc.class);
		} catch (Exception e) {
			logger.error("Failed to load code tables for WFIM", e);
		}
	}

	public List<Message> validateUpdateNotificationSettings(NotificationSettings<? extends Notification> resource,
			LocalDate effectiveAsOfDate) {
		logger.debug("<validateUpdateNotificationSettings");

		List<Message> results = this.validate(resource, new Class<?>[] { NotificationSettingsConstraints.class });

		List<? extends Notification> notifications = resource.getNotifications();
		results.addAll(validateUpdateNotifications(notifications, effectiveAsOfDate));

		logger.debug(">validateUpdateNotificationSettings " + results.size());
		return results;
	}

	public List<Message> validateUpdateNotifications(List<? extends Notification> notifications,
			LocalDate effectiveAsOfDate) {
		logger.debug("<validateUpdateNotifications");

		List<Message> results = new ArrayList<>();

		int i = 0;
		Map<String, Integer> duplicatedMap = new HashMap<String, Integer>();
		for (Notification notification : notifications) {

			List<Message> errors = this.validate(notification, new Class<?>[] { NotificationConstraints.class });

			errors.addAll(validatePoint(notification.getPoint()));

			errors.addAll(validateUpdateTopics(notification, effectiveAsOfDate));

			results.addAll(addParentPath(errors, "notifications[" + i + "]"));

			if (duplicatedMap.containsKey(notification.getNotificationName())) {

				MessageBuilder builder = new MessageBuilder("notifications[" + i + "]",
						Errors.NOTIFICATION_NAME_DUPLICATED, Errors.NOTIFICATION_NAME_DUPLICATED);

				builder.addArg("notificationName", notification.getNotificationName());

				results.add(builder.getMessage());
			} else {
				duplicatedMap.put(notification.getNotificationName(), Integer.valueOf(i));
			}

			++i;
		}

		logger.debug(">validateUpdateNotificationSettings " + results.size());
		return results;
	}

	private static final int TOPIC_MAX_LENGHT = 64;

	private static String[] validTopicsArray = { "British_Columbia_Area_Restrictions",
			"British_Columbia_Bans_and_Prohibition_Areas", "BCWS_ActiveFires_PublicView",
			"Evacuation_Orders_and_Alerts" };
	private static Set<String> validTopics = new HashSet<String>(Arrays.asList(validTopicsArray));

	public List<Message> validateUpdateTopics(Notification notification, LocalDate effectiveAsOfDate) {

		logger.debug("<validateUpdateTopics");

		List<Message> results = new ArrayList<>();

		int i = 0;
		Map<String, Integer> duplicatedMap = new HashMap<String, Integer>();
		for (String topic : notification.getTopics()) {

			if (StringUtils.isBlank(topic)) {

				MessageBuilder builder = new MessageBuilder("topics[" + i + "]", Errors.TOPIC_NOTBLANK,
						Errors.TOPIC_NOTBLANK);

				builder.addArg("value", topic);

				results.add(builder.getMessage());

			} else if (topic.length() > TOPIC_MAX_LENGHT) {

				MessageBuilder builder = new MessageBuilder("topics[" + i + "]", Errors.TOPIC_SIZE, Errors.TOPIC_SIZE);

				builder.addArg("max", Integer.toString(TOPIC_MAX_LENGHT));
				builder.addArg("value", topic);

				results.add(builder.getMessage());

			} else if (notification.getNotificationType() != null
					&& notification.getNotificationType().equalsIgnoreCase("nearme") && !validTopics.contains(topic)) {

				MessageBuilder builder = new MessageBuilder("topics[" + i + "]", Errors.TOPIC_VALUE_INVALID,
						Errors.TOPIC_VALUE_INVALID);

				builder.addArg("value", topic);

				results.add(builder.getMessage());

			}

			if (duplicatedMap.containsKey(topic)) {

				MessageBuilder builder = new MessageBuilder("topics[" + i + "]", Errors.TOPIC_DUPLICATED,
						Errors.TOPIC_DUPLICATED);

				builder.addArg("topic", topic);

				results.add(builder.getMessage());
			} else {
				duplicatedMap.put(topic, Integer.valueOf(i));
			}

			++i;
		}

		logger.debug(">validateUpdateTopics " + results.size());
		return results;
	}

	public List<Message> validatePoint(Geometry point) {

		logger.debug("<validatePoint");

		List<Message> results = new ArrayList<>();

		if (point.getCoordinate().getOrdinate(Coordinate.X) < -180.0
				|| point.getCoordinate().getOrdinate(Coordinate.X) > 0.0) {

			MessageBuilder builder = new MessageBuilder("Point", Errors.NOTIFICATION_LONGITUDE_SIZE,
					Errors.NOTIFICATION_LONGITUDE_SIZE);

			builder.addArg("longitude", Double.toString(point.getCoordinate().getOrdinate(Coordinate.X)));

			results.add(builder.getMessage());
		}

		if (point.getCoordinate().getOrdinate(Coordinate.Y) < 0.0
				|| point.getCoordinate().getOrdinate(Coordinate.Y) > 90.0) {

			MessageBuilder builder = new MessageBuilder("Point", Errors.NOTIFICATION_LATITUDE_SIZE,
					Errors.NOTIFICATION_LATITUDE_SIZE);

			builder.addArg("latitude", Double.toString(point.getCoordinate().getOrdinate(Coordinate.Y)));

			results.add(builder.getMessage());
		}

		logger.debug(">validatePoint " + results.size());
		return results;

	}

	protected static List<Message> addParentPath(List<Message> messages, String parentPath) {

		for (Message message : messages) {

			addParentPath(message, parentPath);
		}

		return messages;
	}

	public static Message addParentPath(Message message, String parentPath) {

		String path = message.getPath();
		path = (path == null) ? "" : path;
		path = parentPath + "." + path;
		message.setPath(path);

		return message;
	}

	public List<Message> validatePublicReportOfFire(PublicReportOfFire prof) throws Exception {
		List<Message> results = this.validate(prof, new Class<?>[] { PublicReportOfFireConstraints.class });
		results.addAll(validateProfCodeTableValues(prof));
		return results;

	}

	private List<Message> validateProfCodeTableValues(PublicReportOfFire prof) throws Exception {
		List<Message> results = new ArrayList<Message>();
		if (prof.getFireSize() != null && !prof.getFireSize().isEmpty()) {
			if (!checkValuePresentOnCodeTable(prof.getFireSize(), RecordServiceConstants.FIRE_SIZE_CODE_TABLE)) {
				MessageBuilder builder = new MessageBuilder("fireSize", Errors.ROF_FIRE_SIZE_INVALID,
						Errors.ROF_FIRE_SIZE_INVALID);
				results.add(builder.getMessage());
			}
		}

		if (prof.getRateOfSpread() != null && !prof.getRateOfSpread().isEmpty()) {
			if (!checkValuePresentOnCodeTable(prof.getRateOfSpread(),
					RecordServiceConstants.RATE_OF_SPREAD_CODE_TABLE)) {
				MessageBuilder builder = new MessageBuilder("rateOfSpread", Errors.ROF_RATE_OF_SPREAD_INVALID,
						Errors.ROF_RATE_OF_SPREAD_INVALID);
				results.add(builder.getMessage());

			}
		}

		if (prof.getSmokeColor() != null && prof.getSmokeColor().length != 0) {
			for (String smokeColor : prof.getSmokeColor()) {
				if (!checkValuePresentOnCodeTable(smokeColor, RecordServiceConstants.SMOKE_COLOUR_CODE_TABLE)) {
					MessageBuilder builder = new MessageBuilder("smokeColor", Errors.ROF_SMOKE_COLOR_INVALID,
							Errors.ROF_SMOKE_COLOR_INVALID);
					results.add(builder.getMessage());
				}
			}
		}

		if (prof.getBurning() != null && prof.getBurning().length != 0) {
			for (String burning : prof.getBurning()) {
				if (!checkValuePresentOnCodeTable(burning, RecordServiceConstants.BURNING_CODE_TABLE)) {
					MessageBuilder builder = new MessageBuilder("burning", Errors.ROF_BURNING_INVALID,
							Errors.ROF_BURNING_INVALID);
					results.add(builder.getMessage());
				}
			}
		}
		return results;
	}

	private boolean checkValuePresentOnCodeTable(String value, String codeTableName) throws Exception {
		loadCodeTables();
		boolean present = false;
		List<CodeTableRsrc> codeTableList = codeTables.getCodeTableList();
		List<String> codeTableNames = new ArrayList<String>();
		CodeTableRsrc relevantTable = new CodeTableRsrc();
		for (CodeTableRsrc codeTable : codeTableList) {
			codeTableNames.add(codeTable.getCodeTableName());
		}
		if (!codeTableNames.contains(codeTableName)) {
			throw new Exception("Exception finding Report of Fire code table: " + codeTableName);
		} else {
			for (CodeTableRsrc codeTable : codeTableList) {
				if (codeTable.getCodeTableName().equalsIgnoreCase(codeTableName)) {
					relevantTable = codeTable;
					break;
				}
			}
		}

		if (relevantTable.getCodes() != null) {
			for (CodeRsrc code : relevantTable.getCodes()) {
				if (code.getCode().equalsIgnoreCase(value)) {
					present = true;
					break;
				}
			}
		}

		return present;
	}
}
