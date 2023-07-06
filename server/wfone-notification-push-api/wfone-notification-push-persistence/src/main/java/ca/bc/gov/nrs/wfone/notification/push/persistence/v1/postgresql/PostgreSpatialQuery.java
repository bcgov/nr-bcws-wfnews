package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationTopicDto;
import com.vividsolutions.jts.geom.Geometry;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PostgreSpatialQuery implements PostgreSqlAreaOfInterestQuery {
	private static final String SQL_COLS =  "SELECT n.notification_guid, \n" +
											"       n.subscriber_guid,\n" +
											"       ns.notification_token,\n" +
											"       n.notification_name,\n" +
											"       n.notification_type,\n" +
											"       n.longitude,\n" +
											"       n.latitude,\n" +
											"       n.radius_kms, \n" +
											"       n.active_ind,\n" +
											"       nt.notification_topic_guid, \n " +
											"       nt.notification_topic_name \n" +
											"FROM public.notification n\n" +
											"LEFT JOIN public.notification_topic nt ON nt.notification_guid  = n.notification_guid\n" +
											"LEFT JOIN public.notification_settings ns ON ns.subscriber_guid  = n.subscriber_guid\n" +
											"WHERE ns.notification_token != '' AND n.active_ind = 'Y' AND nt.notification_topic_name = 'query_topic'";

	private static final String POINT_SQL = SQL_COLS +
			" AND ST_INTERSECTS(n.point_geom_buffered, ST_SetSRID(ST_MakePoint(coordinateX,coordinateY), 4326))";

	private static final String POLY_SQL = SQL_COLS +
			" AND ST_INTERSECTS(n.point_geom_buffered, ST_SetSRID(ST_MakePolygon('coordinates'), 4326))";

	private DataSource dataSource;

	public PostgreSpatialQuery(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	@Override
	public List<NotificationDto> select(Geometry geometry, String topic) throws SQLException {
		List<NotificationDto> subscribers = new ArrayList<>();

		String sqlCustom = "";
		if (geometry.getCoordinates().length == 1) {
			Double x = geometry.getCoordinate().x;
			Double y = geometry.getCoordinate().y;
			sqlCustom = POINT_SQL.replace("coordinateX", Double.toString(x)).replace("coordinateY", Double.toString(y)).replace("query_topic", topic);
		} else {
			String wkt = geometry.getFactory().createLineString(geometry.getCoordinates()).toText();
			sqlCustom = POLY_SQL.replace("coordinates", wkt).replace("query_topic", topic);
		}

		try (Connection con = dataSource.getConnection(); PreparedStatement pst = con.prepareStatement(sqlCustom); ResultSet rs = pst.executeQuery()) {
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

		} catch (SQLException e) {
			throw e;
		}

		return subscribers;
	}
}
