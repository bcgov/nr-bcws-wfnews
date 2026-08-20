package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.GeometryFactory;
import org.junit.Assert;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

public class EventGeometryTest {

	@Test
	public void aPointGivesALongitudeAndALatitude() {
		Map<String, Object> parameters = new HashMap<>();

		EventGeometry.addTo(parameters, new GeometryFactory().createPoint(new Coordinate(-120.0, 50.0)));

		Assert.assertEquals(-120.0, (Double) parameters.get("eventLongitude"), 0.0);
		Assert.assertEquals(50.0, (Double) parameters.get("eventLatitude"), 0.0);
		Assert.assertNull("A point takes the ST_MakePoint branch of the mapper",
				parameters.get("eventRingWkt"));
	}

	@Test
	public void aPolygonGivesTheWellKnownTextOfItsRing() {
		Coordinate[] ring = {new Coordinate(-121.0, 50.0), new Coordinate(-120.0, 50.0),
				new Coordinate(-120.0, 51.0), new Coordinate(-121.0, 50.0)};
		Map<String, Object> parameters = new HashMap<>();

		EventGeometry.addTo(parameters, new GeometryFactory().createLineString(ring));

		String wkt = (String) parameters.get("eventRingWkt");
		Assert.assertTrue("ST_MakePolygon needs a linestring", wkt.startsWith("LINESTRING"));
		Assert.assertTrue("The ring must close, or ST_MakePolygon fails", wkt.endsWith("-121 50)"));
		Assert.assertNull("A polygon takes the ST_MakePolygon branch of the mapper",
				parameters.get("eventLongitude"));
	}

	@Test
	public void theCoordinatesAreBoundAndNotWrittenIntoTheStatement() {
		Map<String, Object> parameters = new HashMap<>();

		EventGeometry.addTo(parameters, new GeometryFactory().createPoint(new Coordinate(-119.496, 49.888)));

		Assert.assertTrue("A number, not a string: the mapper binds it",
				parameters.get("eventLongitude") instanceof Double);
		Assert.assertTrue(parameters.get("eventLatitude") instanceof Double);
	}
}
