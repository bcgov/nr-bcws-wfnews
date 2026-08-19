-- The production schema, copied from database/scripts/01_00_00-notifications.
CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS notification_push_item;
DROP TABLE IF EXISTS notification_topic;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS notification_settings;

CREATE TABLE notification_settings (
	subscriber_guid VARCHAR(64) NOT NULL,
	subscriber_token VARCHAR(256) NOT NULL,
	notification_token VARCHAR(256) NOT NULL,
	device_type VARCHAR(20),
	revision_count NUMERIC(10) NOT NULL DEFAULT 0,
	create_timestamp TIMESTAMP NOT NULL DEFAULT current_timestamp,
	create_user VARCHAR(64) NOT NULL,
	update_timestamp TIMESTAMP NOT NULL DEFAULT current_timestamp,
	update_user VARCHAR(64) NOT NULL,
	CONSTRAINT notification_settingsPK PRIMARY KEY (subscriber_guid)
);

CREATE TABLE notification (
	notification_guid VARCHAR(64) NOT NULL,
	subscriber_guid VARCHAR(64) NOT NULL,
	notification_name VARCHAR(64) NOT NULL,
	notification_type VARCHAR(64),
	longitude VARCHAR(64),
	latitude VARCHAR(64),
	radius_kms NUMERIC(7,2),
	active_ind CHAR(1),
	revision_count NUMERIC(10) NOT NULL DEFAULT 0,
	create_timestamp TIMESTAMP NOT NULL DEFAULT current_timestamp,
	create_user VARCHAR(64) NOT NULL,
	update_timestamp TIMESTAMP NOT NULL DEFAULT current_timestamp,
	update_user VARCHAR(64) NOT NULL,
	CONSTRAINT notificationPK PRIMARY KEY (notification_guid),
	CONSTRAINT notification_settingsFK FOREIGN KEY (subscriber_guid)
		REFERENCES notification_settings(subscriber_guid) ON DELETE CASCADE
);

CREATE TABLE notification_topic (
	notification_topic_guid VARCHAR(64) NOT NULL,
	notification_guid VARCHAR(64) NOT NULL,
	notification_topic_name VARCHAR(64) NOT NULL,
	revision_count NUMERIC(10) NOT NULL DEFAULT 0,
	create_timestamp TIMESTAMP NOT NULL DEFAULT current_timestamp,
	create_user VARCHAR(64) NOT NULL,
	update_timestamp TIMESTAMP NOT NULL DEFAULT current_timestamp,
	update_user VARCHAR(64) NOT NULL,
	CONSTRAINT notification_topicPK PRIMARY KEY (notification_topic_guid),
	CONSTRAINT notification_topicFK FOREIGN KEY (notification_guid)
		REFERENCES notification(notification_guid) ON DELETE CASCADE
);

ALTER TABLE notification ADD COLUMN point_geom geometry(Point, 4326) NULL;
ALTER TABLE notification ADD COLUMN point_geom_buffered geometry(Polygon, 4326) NULL;

-- The work list. Production shape, plus the work list changeset:
-- database/scripts/01_01_00-notifications/02/ddl/wfone.ddl.notification_push_item_work_list.sql
CREATE TABLE notification_push_item (
	notification_push_item_guid VARCHAR(64) NOT NULL,
	notification_guid VARCHAR(64) NOT NULL,
	subscriber_guid VARCHAR(64),
	push_timestamp TIMESTAMP NOT NULL DEFAULT current_timestamp,
	sent_timestamp TIMESTAMP,
	item_expiry_timestamp TIMESTAMP,
	item_identifier VARCHAR(256),
	revision_count NUMERIC(10) NOT NULL DEFAULT 0,
	create_timestamp TIMESTAMP NOT NULL DEFAULT current_timestamp,
	create_user VARCHAR(64) NOT NULL,
	update_timestamp TIMESTAMP NOT NULL DEFAULT current_timestamp,
	update_user VARCHAR(64) NOT NULL,
	CONSTRAINT notification_push_itemPK PRIMARY KEY (notification_push_item_guid),
	CONSTRAINT notificationFK FOREIGN KEY (notification_guid)
		REFERENCES notification(notification_guid) ON DELETE CASCADE
);

CREATE UNIQUE INDEX notification_push_item_uk
	ON notification_push_item (notification_guid, item_identifier);

CREATE INDEX notification_push_item_expiry_idx
	ON notification_push_item (item_expiry_timestamp);

-- The send pass cursor. One index for the filter and the order together.
CREATE INDEX notification_push_item_unsent_idx
	ON notification_push_item (item_identifier, subscriber_guid, notification_push_item_guid)
	WHERE sent_timestamp IS NULL;
