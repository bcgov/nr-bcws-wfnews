package ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dao;

import java.util.Date;
import java.util.List;

import com.vividsolutions.jts.geom.Geometry;

import ca.bc.gov.nrs.wfone.common.persistence.dao.DaoException;
import ca.bc.gov.nrs.wfone.notification.push.persistence.v1.dto.NotificationDto;

public interface NotificationPushItemDao {

	/** Runs the spatial query and writes one row for each recipient, inside the database. */
	int materialiseAudience(Geometry eventGeometry, String topic, String itemIdentifier, Date pushTimestamp,
			Date itemExpiryTimestamp, String userId) throws DaoException;

	/**
	 * Marks the next page sent and reads it in one statement, so two workers cannot take the
	 * same row. Pass empty strings for the first page. The rows come back ordered by subscriber.
	 */
	List<NotificationDto> claimPushItems(String itemIdentifier, String afterSubscriberGuid, String afterPushItemGuid,
			int pageSize) throws DaoException;

	/** Clears sent_timestamp, so a later delivery tries the rows again. The rows stay. */
	int releasePushItems(List<String> pushItemGuids, String itemIdentifier) throws DaoException;

	/** Deletes at most limit expired rows. Returns the count, so the caller can loop. */
	int deleteExpired(int limit) throws DaoException;

}
