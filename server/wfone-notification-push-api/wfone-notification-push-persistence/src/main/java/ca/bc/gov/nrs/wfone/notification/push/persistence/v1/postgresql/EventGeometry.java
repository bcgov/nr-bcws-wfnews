package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql;

import com.vividsolutions.jts.geom.Geometry;

import java.util.Map;

/** Binds an event geometry: a point gives a longitude and a latitude, anything else a ring. */
public final class EventGeometry {

	private EventGeometry() {
	}

	public static void addTo(Map<String, Object> parameters, Geometry geometry) {
		if (geometry.getCoordinates().length == 1) {
			parameters.put("eventLongitude", geometry.getCoordinate().x);
			parameters.put("eventLatitude", geometry.getCoordinate().y);
		} else {
			parameters.put("eventRingWkt", geometry.getFactory().createLineString(geometry.getCoordinates()).toText());
		}
	}
}
