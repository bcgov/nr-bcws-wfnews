package ca.bc.gov.nrs.wfone.notification.push.service.api.v1.monitor.handler;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.type.NotificationTopics;
import ca.bc.gov.nrs.wfone.notification.push.service.api.v1.model.MessageInformation;
import com.amazonaws.services.sqs.model.Message;
import com.vividsolutions.jts.algorithm.ConvexHull;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SpatialMonitorHandler implements MonitorHandler {
	private static final String MONITOR_ATTRIBUTE = "monitorType";

	@Override
	public MessageInformation handleMessage(Message message) {
		String monitorType = message.getMessageAttributes().get(MONITOR_ATTRIBUTE).getStringValue();

		JSONObject jsonObject = new JSONObject(message.getBody());
		String messageId = null;
		Long epoch = null;
		String topic = null;
		Map<String, String> eventInformation = new HashMap<>();

		switch (monitorType) {
		case "active-fires":
			if (jsonObject.has(MessageInformation.FIRE_NUMBER) && !jsonObject.isNull(MessageInformation.FIRE_NUMBER)) {
				messageId = jsonObject.getString(MessageInformation.FIRE_NUMBER);
			}

			if (jsonObject.has(MessageInformation.IGNITION_DATE) && !jsonObject.isNull(MessageInformation.IGNITION_DATE)) {
				epoch = jsonObject.getLong(MessageInformation.IGNITION_DATE);
			}

			topic = NotificationTopics.BCWF_ACTIVEFIRES_PUBLIVIEW;
			eventInformation.put(MessageInformation.FIRE_NUMBER, messageId);

			if (jsonObject.has(MessageInformation.FIRE_YEAR) && !jsonObject.isNull(MessageInformation.FIRE_YEAR)) {
				String fireYear = String.valueOf(jsonObject.getInt(MessageInformation.FIRE_YEAR));
				eventInformation.put(MessageInformation.FIRE_YEAR, fireYear);
			}

			break;
		case "area-restrictions":
			messageId = String.valueOf(jsonObject.getJSONObject("attributes").getString("FIRE_CENTRE_NAME"));
			epoch = jsonObject.getJSONObject("attributes").getLong("ACCESS_STATUS_EFFECTIVE_DATE");
			topic = NotificationTopics.BRITISH_COLUMBIA_AREA_RESTRICTIONS;
			updateStringAttribute(jsonObject, MessageInformation.FIRE_CENTRE_NAME, eventInformation);
			updateStringAttribute(jsonObject, MessageInformation.FIRE_ZONE_NAME, eventInformation);
			updateStringAttribute(jsonObject, MessageInformation.NAME, eventInformation);
			break;
		case "bans-prohibitions":
			messageId = String.valueOf(jsonObject.getJSONObject("attributes").getString("FIRE_CENTRE_NAME"));
			epoch = jsonObject.getJSONObject("attributes").getLong("ACCESS_STATUS_EFFECTIVE_DATE");
			topic = NotificationTopics.BRITISH_COLUMBIA_BANS_AND_PROHIBITION_AREAS;
			updateStringAttribute(jsonObject, MessageInformation.FIRE_CENTRE_NAME, eventInformation);
			updateStringAttribute(jsonObject, MessageInformation.FIRE_ZONE_NAME, eventInformation);
			updateStringAttribute(jsonObject, MessageInformation.ACCESS_PROHIBITION_DESCRIPTION, eventInformation);
			updateStringAttribute(jsonObject, MessageInformation.TYPE, eventInformation);
			break;
		case "evacuation-orders-alerts":
			if (jsonObject.getJSONObject("attributes").has("EVENT_NAME")) {
				messageId = jsonObject.getJSONObject("attributes").getString("EVENT_NAME");
				eventInformation.put(MessageInformation.EVENT_NAME, messageId);
			} else {
				messageId = String.valueOf(jsonObject.getJSONObject("attributes").getInt("EMRG_OAA_SYSID"));
			}
			epoch = jsonObject.getJSONObject("attributes").getLong("DATE_MODIFIED");
			topic = NotificationTopics.EVACUATION_ORDERS_AND_ALERTS;
			updateStringAttribute(jsonObject, MessageInformation.ISSUING_AGENCY, eventInformation);
			break;
		}

		Date messageDate = new Date(epoch);

		Geometry geometry = null;
		GeometryFactory factory = new GeometryFactory();
		switch (monitorType) {
		case "active-fires":
			Double longitude = jsonObject.getDouble(MessageInformation.LONGITUDE);
			Double latitude = jsonObject.getDouble(MessageInformation.LATITUDE);
			geometry = factory.createPoint(new Coordinate(longitude, latitude));
			geometry.setSRID(4326);
			break;
		case "area-restrictions":
		case "bans-prohibitions":
		case "evacuation-orders-alerts":
			if (jsonObject.getJSONObject("geometry").has("rings")) {
				List<Coordinate> coords = new ArrayList<>();
				JSONArray rings = jsonObject.getJSONObject("geometry").getJSONArray("rings");
				for (int i = 0; i < rings.length(); i++) {
					for (Object coordArray : rings.getJSONArray(i)) {
						double x = ((JSONArray) coordArray).getDouble(0);
						double y = ((JSONArray) coordArray).getDouble(1);
						coords.add(new Coordinate(x, y));
					}
				}
				ConvexHull hull = new ConvexHull(coords.toArray(new Coordinate[coords.size()]), factory);
				geometry = hull.getConvexHull();
			} else {
				Double coordinateX = jsonObject.getJSONObject("geometry").getDouble("x");
				Double coordinateY = jsonObject.getJSONObject("geometry").getDouble("y");
				geometry = factory.createPoint(new Coordinate(coordinateX, coordinateY));
			}

			geometry.setSRID(4326);
			break;
		}

		return new MessageInformation(messageId, messageDate, geometry, topic, eventInformation);
	}

	private void updateStringAttribute(JSONObject jsonObject, String attributeKey,
			Map<String, String> eventInformation) {
		if (jsonObject.getJSONObject("attributes").has(attributeKey)) {
			boolean isAttributeNull = jsonObject.getJSONObject("attributes").isNull(attributeKey);
			if (!isAttributeNull) {
				String attribute = jsonObject.getJSONObject("attributes").getString(attributeKey);
				eventInformation.put(attributeKey, attribute);
			}
		}
	}
}
