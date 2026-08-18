package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import com.vividsolutions.jts.geom.Geometry;

import java.sql.SQLException;
import java.util.List;

public interface PostgreSqlAreaOfInterestQuery {

	/**
	 * Reads one page of the audience, ordered by subscriber guid, then by the distance from
	 * the event. Pass null or an empty string for the first page, then the subscriber guid
	 * of the last row of the previous page.
	 * <p>
	 * A subscriber never spans two pages, so a caller can send one push for each subscriber
	 * without a look at any other page. The rows of one subscriber are nearest first.
	 * <p>
	 * A short page does not mean the last page, because the partial trailing subscriber is
	 * trimmed. Read until the page is empty.
	 */
	List<NotificationDto> select(Geometry geometry, String topic, String afterSubscriberGuid, int pageSize)
			throws SQLException;

}
