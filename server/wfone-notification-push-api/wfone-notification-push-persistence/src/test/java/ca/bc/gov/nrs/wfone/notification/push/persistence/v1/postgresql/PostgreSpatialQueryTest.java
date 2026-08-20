package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.GeometryFactory;
import org.junit.Assert;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

/** The page must never cut a subscriber in half, or that subscriber gets two pushes. */
public class PostgreSpatialQueryTest {

	@Test
	public void aShortPageIsTheLastPageAndKeepsEveryRow() {
		List<NotificationDto> rows = rows("sub-1", "sub-1", "sub-2");

		List<NotificationDto> result = PostgreSpatialQuery.trimPartialTrailingSubscriber(rows, 10);

		Assert.assertEquals(3, result.size());
	}

	@Test
	public void aFullPageDropsTheTrailingSubscriber() {
		// sub-3 may have more rows past the limit, so it waits for the next page.
		List<NotificationDto> rows = rows("sub-1", "sub-2", "sub-3", "sub-3");

		List<NotificationDto> result = PostgreSpatialQuery.trimPartialTrailingSubscriber(rows, 4);

		Assert.assertEquals(2, result.size());
		Assert.assertEquals("sub-1", result.get(0).getSubscriberGuid());
		Assert.assertEquals("sub-2", result.get(1).getSubscriberGuid());
	}

	@Test
	public void aFullPageOfOneSubscriberIsKept() {
		// Dropping this page would make the read stop and the audience would be incomplete.
		List<NotificationDto> rows = rows("sub-1", "sub-1", "sub-1");

		List<NotificationDto> result = PostgreSpatialQuery.trimPartialTrailingSubscriber(rows, 3);

		Assert.assertEquals(3, result.size());
	}

	@Test
	public void anEmptyPageStaysEmpty() {
		List<NotificationDto> result = PostgreSpatialQuery.trimPartialTrailingSubscriber(new ArrayList<>(), 10);

		Assert.assertTrue(result.isEmpty());
	}

	@Test
	public void thePointQueryOrdersBySubscriberThenByDistance() {
		String sql = PostgreSpatialQuery.buildSql(
				new GeometryFactory().createPoint(new Coordinate(-120.0, 50.0)), "British Columbia Area Restrictions");

		Assert.assertTrue(sql.contains("ST_MakePoint(-120.0,50.0)"));
		Assert.assertTrue("The order is two plain columns, so an index can supply it",
				sql.contains("ORDER BY n.subscriber_guid, n.notification_guid"));
		Assert.assertFalse("No computed distance in the order: it forces a sort of the whole audience",
				sql.contains("ST_DistanceSphere"));
		Assert.assertFalse("longitude and latitude are varchar, so they never go into ST_MakePoint",
				sql.contains("ST_MakePoint(n.longitude"));
		Assert.assertTrue("The keyset is the subscriber, not the notification",
				sql.contains("AND n.subscriber_guid > ?"));
		Assert.assertFalse("The old notification keyset is gone", sql.contains("n.notification_guid > ?"));
		Assert.assertTrue(sql.contains("nt.notification_topic_name = 'British Columbia Area Restrictions'"));
	}

	@Test
	public void thePolygonQueryBuildsTheGeometryOnce() {
		Coordinate[] ring = {new Coordinate(-121.0, 50.0), new Coordinate(-120.0, 50.0),
				new Coordinate(-120.0, 51.0), new Coordinate(-121.0, 50.0)};
		String sql = PostgreSpatialQuery.buildSql(new GeometryFactory().createLineString(ring), "any topic");

		Assert.assertEquals("The event geometry is built once, for the intersect only", 1,
				sql.split("ST_MakePolygon", -1).length - 1);
		Assert.assertTrue(sql.contains("ST_INTERSECTS(n.point_geom_buffered, ST_SetSRID(ST_MakePolygon("));
	}

	private static List<NotificationDto> rows(String... subscriberGuids) {
		List<NotificationDto> result = new ArrayList<>();

		for (int i = 0; i < subscriberGuids.length; i++) {
			NotificationDto dto = new NotificationDto();
			dto.setSubscriberGuid(subscriberGuids[i]);
			dto.setNotificationGuid("guid-" + i);
			result.add(dto);
		}

		return result;
	}
}
