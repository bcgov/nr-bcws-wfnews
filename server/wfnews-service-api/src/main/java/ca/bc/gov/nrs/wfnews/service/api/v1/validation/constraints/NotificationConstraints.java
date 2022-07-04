package ca.bc.gov.nrs.wfnews.service.api.v1.validation.constraints;

import java.util.List;

import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import com.vividsolutions.jts.geom.Geometry;

import ca.bc.gov.nrs.wfnews.service.api.v1.validation.Errors;

public interface NotificationConstraints {

	@NotBlank(message=Errors.NOTIFICATION_NAME_NOTBLANK, groups=NotificationConstraints.class)
	@Size(min=1, max=64, message=Errors.NOTIFICATION_NAME_SIZE, groups=NotificationConstraints.class)
	String getNotificationName();

	@NotBlank(message=Errors.NOTIFICATION_TYPE_NOTBLANK, groups=NotificationConstraints.class)
	@Size(min=1, max=64, message=Errors.NOTIFICATION_TYPE_SIZE, groups=NotificationConstraints.class)
	String getNotificationType();

	@DecimalMin(value = "1.0", message=Errors.NOTIFICATION_RADIUS_MIN_SIZE, groups=NotificationConstraints.class)
	@DecimalMax(value = "1000.0", message=Errors.NOTIFICATION_RADIUS_MAX_SIZE, groups=NotificationConstraints.class)
	Double getRadius();

	Geometry getPoint();

	List<String> getTopics();


}
