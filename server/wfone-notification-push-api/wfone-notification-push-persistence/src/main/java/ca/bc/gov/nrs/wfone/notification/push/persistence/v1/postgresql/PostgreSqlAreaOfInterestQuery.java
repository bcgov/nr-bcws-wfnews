package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.postgresql;

import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;
import com.vividsolutions.jts.geom.Geometry;

import java.sql.SQLException;
import java.util.List;

public interface PostgreSqlAreaOfInterestQuery {

	List<NotificationDto> select(Geometry geometry, String topic) throws SQLException;

}
