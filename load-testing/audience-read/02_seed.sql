-- 1,000,000 subscribers, clustered the way BC population is clustered, each with 1 to 5
-- saved locations near each other, so that saved locations overlap.
--
-- Takes about 6 minutes. The seed is fixed, so two runs give the same rows.
\timing on

SELECT setseed(0.42);

INSERT INTO notification_settings
	(subscriber_guid, subscriber_token, notification_token, device_type, create_user, update_user)
SELECT
	'sub-' || lpad(s::text, 8, '0'),
	'stoken-' || s,
	'ftoken-' || s,
	CASE WHEN s % 2 = 0 THEN 'android' ELSE 'ios' END,
	'seed', 'seed'
FROM generate_series(1, 1000000) s;

-- Home points. The cluster picks the region, then a spread inside it.
CREATE TEMP TABLE home AS
SELECT
	s AS n,
	'sub-' || lpad(s::text, 8, '0') AS subscriber_guid,
	CASE WHEN r < 0.40 THEN 49.25
	     WHEN r < 0.52 THEN 48.90
	     WHEN r < 0.67 THEN 49.90
	     WHEN r < 0.75 THEN 50.70
	     WHEN r < 0.82 THEN 53.90
	     ELSE 48.30 + random() * 11.0 END
	  + CASE WHEN r < 0.82 THEN (random() - 0.5) * 1.2 ELSE 0 END AS lat,
	CASE WHEN r < 0.40 THEN -122.90
	     WHEN r < 0.52 THEN -124.00
	     WHEN r < 0.67 THEN -119.50
	     WHEN r < 0.75 THEN -120.30
	     WHEN r < 0.82 THEN -122.70
	     ELSE -139.00 + random() * 25.0 END
	  + CASE WHEN r < 0.82 THEN (random() - 0.5) * 1.6 ELSE 0 END AS lon,
	CASE WHEN c < 0.60 THEN 1 WHEN c < 0.85 THEN 2 WHEN c < 0.95 THEN 3 ELSE 5 END AS locations
FROM (SELECT s, random() AS r, random() AS c FROM generate_series(1, 1000000) s) q;

INSERT INTO notification
	(notification_guid, subscriber_guid, notification_name, notification_type, longitude, latitude,
	 radius_kms, active_ind, create_user, update_user, point_geom, point_geom_buffered)
SELECT
	'notif-' || h.n || '-' || i,
	h.subscriber_guid,
	'Place ' || i,
	'SAVED',
	p.lon::text,
	p.lat::text,
	p.radius,
	'Y',
	'seed', 'seed',
	ST_SetSRID(ST_MakePoint(p.lon, p.lat), 4326),
	ST_Buffer(Geography(ST_MakePoint(p.lon, p.lat)), p.radius * 1000)::Geometry
FROM home h
CROSS JOIN LATERAL generate_series(1, h.locations) i
CROSS JOIN LATERAL (
	-- The extra saved locations sit within about 30 km of home, so they overlap.
	SELECT h.lat + CASE WHEN i = 1 THEN 0 ELSE (random() - 0.5) * 0.5 END AS lat,
	       h.lon + CASE WHEN i = 1 THEN 0 ELSE (random() - 0.5) * 0.7 END AS lon,
	       (10 + random() * 40)::numeric(7,2) AS radius
) p;

INSERT INTO notification_topic
	(notification_topic_guid, notification_guid, notification_topic_name, create_user, update_user)
SELECT n.notification_guid || '-' || t.name, n.notification_guid, t.name, 'seed', 'seed'
FROM notification n
CROSS JOIN (VALUES
	('British Columbia Area Restrictions'),
	('Evacuation Orders and Alerts'),
	('British Columbia Bans and Prohibition Areas'),
	('BCWS_ActiveFires_PublicView')
) AS t(name);

-- The production indexes, exactly as database/scripts ships them.
CREATE INDEX notif_point_geom_idx ON public.notification USING gist(point_geom);
CREATE INDEX notif_point_geog_idx ON public.notification USING gist(geography(point_geom));
CREATE INDEX notif_point_geom_buff_idx ON public.notification USING gist(point_geom_buffered);
CREATE INDEX notification_topic_guid_idx ON public.notification_topic (notification_guid);

VACUUM ANALYZE notification;
VACUUM ANALYZE notification_topic;
VACUUM ANALYZE notification_settings;

-- Expect 1000000 | 1649922 | 6599688.
SELECT
	(SELECT count(*) FROM notification_settings) AS subscribers,
	(SELECT count(*) FROM notification) AS saved_locations,
	(SELECT count(*) FROM notification_topic) AS topics;
