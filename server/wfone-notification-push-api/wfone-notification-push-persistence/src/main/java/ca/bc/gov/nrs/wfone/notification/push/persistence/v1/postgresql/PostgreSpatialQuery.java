package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationTopicDto;
import com.vividsolutions.jts.geom.Geometry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PostgreSpatialQuery implements PostgreSqlAreaOfInterestQuery {
	private static final Logger logger = LoggerFactory.getLogger(PostgreSpatialQuery.class);

	// event_geom is replaced with the event geometry, in both places.
	private static final String SQL_COLS = """
			SELECT n.notification_guid,
			       n.subscriber_guid,
			       ns.notification_token,
			       n.notification_name,
			       n.notification_type,
			       n.longitude,
			       n.latitude,
			       n.radius_kms,
			       n.active_ind,
			       nt.notification_topic_guid,
			       nt.notification_topic_name
			FROM public.notification n
			LEFT JOIN public.notification_topic nt ON nt.notification_guid = n.notification_guid
			LEFT JOIN public.notification_settings ns ON ns.subscriber_guid = n.subscriber_guid
			WHERE ns.notification_token != '' AND n.active_ind = 'Y' AND nt.notification_topic_name = 'query_topic'
			  AND ST_INTERSECTS(n.point_geom_buffered, event_geom)""";

	private static final String POINT_GEOM = "ST_SetSRID(ST_MakePoint(coordinateX,coordinateY), 4326)";

	private static final String POLY_GEOM = "ST_SetSRID(ST_MakePolygon('coordinates'), 4326)";

	// Keyset pagination on the subscriber, so that all the saved locations of one
	// subscriber stay together and one subscriber gets one push. Unlike the rest of this
	// query, these two are real bind parameters.
	//
	// The order holds no distance on purpose. A computed distance in the ORDER BY makes
	// the database sort the whole audience on every page, and no index can supply that
	// order. The service ranks each group instead, from the latitude and the longitude
	// that this query already returns.
	private static final String PAGE_SQL = """

			  AND n.subscriber_guid > ?
			ORDER BY n.subscriber_guid, n.notification_guid
			LIMIT ?""";

	private DataSource dataSource;

	public PostgreSpatialQuery(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	@Override
	public List<NotificationDto> select(Geometry geometry, String topic, String afterSubscriberGuid, int pageSize)
			throws SQLException {
		List<NotificationDto> subscribers = new ArrayList<>();

		String sqlCustom = buildSql(geometry, topic);

		// An empty string is less than every guid, so it selects the first page.
		String afterGuid = afterSubscriberGuid == null ? "" : afterSubscriberGuid;

		try (Connection con = dataSource.getConnection();
				PreparedStatement pst = con.prepareStatement(sqlCustom)) {
			pst.setString(1, afterGuid);
			pst.setInt(2, pageSize);

			try (ResultSet rs = pst.executeQuery()) {
				while (rs.next()) {
					NotificationDto notificationDto = new NotificationDto();
					notificationDto.setNotificationGuid(rs.getString("notification_guid"));
					notificationDto.setSubscriberGuid(rs.getString("subscriber_guid"));
					notificationDto.setNotificationName(rs.getString("notification_name"));
					notificationDto.setNotificationType(rs.getString("notification_type"));
					notificationDto.setLongitude(Double.parseDouble(rs.getString("longitude")));
					notificationDto.setLatitude(Double.parseDouble(rs.getString("latitude")));
					notificationDto.setRadius(Double.parseDouble(rs.getString("radius_kms")));
					notificationDto.setNotificationToken(rs.getString("notification_token"));
					notificationDto.setActiveIndicator(rs.getString("active_ind").equals("Y") ? true : false);

					// TODO: FX, might need to change
					List<NotificationTopicDto> topics = new ArrayList<>();
					String notificationTopicGuid = rs.getString("notification_topic_guid");
					String notificationTopicName = rs.getString("notification_topic_name");

					if (notificationTopicGuid != null && notificationTopicName != null) {
						NotificationTopicDto notificationTopicDto = new NotificationTopicDto();
						notificationTopicDto.setNotificationTopicGuid(notificationTopicGuid);
						notificationTopicDto.setNotificationTopicName(notificationTopicName);
						notificationTopicDto.setNotificationGuid(rs.getString("notification_guid"));

						topics.add(notificationTopicDto);
					}

					notificationDto.setTopics(topics);
					subscribers.add(notificationDto);
				}
			}

		} catch (SQLException e) {
			throw e;
		}

		return trimPartialTrailingSubscriber(subscribers, pageSize);
	}

	// Package private for the test. Nothing outside this class calls it.
	static String buildSql(Geometry geometry, String topic) {
		String eventGeom;

		if (geometry.getCoordinates().length == 1) {
			Double x = geometry.getCoordinate().x;
			Double y = geometry.getCoordinate().y;
			eventGeom = POINT_GEOM.replace("coordinateX", Double.toString(x)).replace("coordinateY", Double.toString(y));
		} else {
			String wkt = geometry.getFactory().createLineString(geometry.getCoordinates()).toText();
			eventGeom = POLY_GEOM.replace("coordinates", wkt);
		}

		return SQL_COLS.replace("query_topic", topic).replace("event_geom", eventGeom) + PAGE_SQL;
	}

	/**
	 * The LIMIT can cut the last subscriber in half. Drop that group and let the next page
	 * read it whole. Without this one subscriber spans two pages, two threads send to that
	 * subscriber, and the caller cannot see it because each thread holds one page.
	 */
	// Package private for the test. Nothing outside this class calls it.
	static List<NotificationDto> trimPartialTrailingSubscriber(List<NotificationDto> rows, int pageSize) {
		if (rows.size() < pageSize) {
			return rows;
		}

		String lastSubscriberGuid = rows.get(rows.size() - 1).getSubscriberGuid();

		int end = rows.size();
		while (end > 0 && lastSubscriberGuid.equals(rows.get(end - 1).getSubscriberGuid())) {
			end--;
		}

		if (end == 0) {
			// One subscriber fills a whole page. Keep it, or the read never advances.
			logger.warn("Subscriber {} has at least {} matched saved locations. Reading it in one page.",
					lastSubscriberGuid, pageSize);
			return rows;
		}

		return rows.subList(0, end);
	}
}
