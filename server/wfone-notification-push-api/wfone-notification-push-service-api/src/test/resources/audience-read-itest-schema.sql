-- The schema for AudienceReadIntegrationTest, copied from database/scripts.
--
-- Set -Dwfnews.itest.skipSchema=true to skip this file and seed a Liquibase built database.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
CREATE INDEX notif_point_geom_buff_idx ON notification USING gist(point_geom_buffered);

CREATE OR REPLACE FUNCTION set_notification_geometries()
  RETURNS trigger LANGUAGE PLPGSQL AS '
BEGIN
  IF ((NEW.latitude IS NOT NULL) AND (NEW.longitude IS NOT NULL)) THEN
    New.point_geom = ST_SetSRID(ST_MakePoint(NEW.longitude::double precision, NEW.latitude::double precision), 4326);
    New.point_geom_buffered = ST_BUFFER(Geography(ST_MakePoint(NEW.longitude::double precision, NEW.latitude::double precision)), NEW.radius_kms*1000)::Geometry;
  END IF;
  RETURN NEW;
END; ';

CREATE TRIGGER notification_changes
  BEFORE INSERT OR UPDATE OF longitude, latitude ON notification
  FOR EACH ROW EXECUTE PROCEDURE set_notification_geometries();

-- The work list columns and index are already applied here.
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
CREATE INDEX notification_push_item_unsent_idx
	ON notification_push_item (item_identifier, subscriber_guid, notification_push_item_guid)
	WHERE sent_timestamp IS NULL;
