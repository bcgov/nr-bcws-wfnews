package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import com.vividsolutions.jts.geom.Geometry;

import java.sql.SQLException;
import java.util.List;

public interface PostgreSqlAreaOfInterestQuery {

	/**
	 * Reads one page of the audience, ordered by notification guid. Pass null or an empty
	 * string for the first page, then the last guid of the previous page.
	 */
	List<NotificationDto> select(Geometry geometry, String topic, String afterNotificationGuid, int pageSize)
			throws SQLException;

}
