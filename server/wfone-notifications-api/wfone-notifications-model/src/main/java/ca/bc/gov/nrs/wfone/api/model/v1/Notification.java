package ca.bc.gov.nrs.wfone.api.model.v1;

import java.io.Serializable;
import java.util.List;

import com.vividsolutions.jts.geom.Geometry;

public interface Notification extends Serializable {

		String getNotificationName();

		void setNotificationName(String notificationName);

		String getNotificationType();

		void setNotificationType(String notificationType);

		List<String> getTopics();

		void setTopics(List<String> topics);

		Double getRadius();

		void setRadius(Double radius);

		Geometry getPoint();

		void setPoint(Geometry point);

		Boolean getActiveIndicator();

		void setActiveIndicator(Boolean activeIndicator);
		
	
}
