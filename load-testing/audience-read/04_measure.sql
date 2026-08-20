-- The two events, the audience sizes, the collapse ratio, and the drains.
-- Run this after 01, 02 and 03.
\timing on

\set point_geom 'ST_SetSRID(ST_MakePoint(-119.5,49.9),4326)'
\set poly_geom 'ST_SetSRID(ST_MakePolygon(ST_GeomFromText(''LINESTRING(-120.6 49.2, -118.6 49.2, -118.6 50.6, -120.6 50.6, -120.6 49.2)'')),4326)'

-- 1. The audience, and what the collapse removes from the FCM work.
SELECT 'point fire (Kelowna)' AS event,
       count(*) AS saved_locations,
       count(DISTINCT n.subscriber_guid) AS subscribers,
       round(count(*)::numeric / count(DISTINCT n.subscriber_guid), 3) AS locations_per_subscriber,
       round(100 - 100.0 * count(DISTINCT n.subscriber_guid) / count(*), 1) AS pct_fcm_work_removed
FROM notification n
JOIN notification_topic nt ON nt.notification_guid = n.notification_guid
JOIN notification_settings ns ON ns.subscriber_guid = n.subscriber_guid
WHERE ns.notification_token <> '' AND n.active_ind = 'Y'
  AND nt.notification_topic_name = 'BCWS_ActiveFires_PublicView'
  AND ST_INTERSECTS(n.point_geom_buffered, :point_geom)
UNION ALL
SELECT 'evacuation polygon (Okanagan)',
       count(*),
       count(DISTINCT n.subscriber_guid),
       round(count(*)::numeric / count(DISTINCT n.subscriber_guid), 3),
       round(100 - 100.0 * count(DISTINCT n.subscriber_guid) / count(*), 1)
FROM notification n
JOIN notification_topic nt ON nt.notification_guid = n.notification_guid
JOIN notification_settings ns ON ns.subscriber_guid = n.subscriber_guid
WHERE ns.notification_token <> '' AND n.active_ind = 'Y'
  AND nt.notification_topic_name = 'Evacuation Orders and Alerts'
  AND ST_INTERSECTS(n.point_geom_buffered, :poly_geom);

-- 2. One scan. This is the target for the Materialise pass.
SELECT count(*) AS point_one_scan_rows FROM (
	SELECT n.notification_guid
	FROM notification n
	LEFT JOIN notification_topic nt ON nt.notification_guid = n.notification_guid
	LEFT JOIN notification_settings ns ON ns.subscriber_guid = n.subscriber_guid
	WHERE ns.notification_token <> '' AND n.active_ind = 'Y'
	  AND nt.notification_topic_name = 'BCWS_ActiveFires_PublicView'
	  AND ST_INTERSECTS(n.point_geom_buffered, :point_geom)
	ORDER BY n.subscriber_guid, n.notification_guid) q;

-- 3. The paged drains.
-- Caution: the polygon drain of v3 takes about 18 minutes. Run it on its own.
SELECT 'v1 part 6' AS variant, * FROM drain_v1('BCWS_ActiveFires_PublicView', :point_geom, 1000)
UNION ALL SELECT 'v2 distance order', * FROM drain_v2('BCWS_ActiveFires_PublicView', :point_geom, 1000)
UNION ALL SELECT 'v3 two columns', * FROM drain_v3('BCWS_ActiveFires_PublicView', :point_geom, 1000);

-- 4. Why. The cursor is a filter, not an index condition.
EXPLAIN (ANALYZE, BUFFERS, COSTS OFF)
SELECT n.notification_guid, n.subscriber_guid, ns.notification_token, n.notification_name,
       n.longitude, n.latitude, n.radius_kms, n.active_ind,
       nt.notification_topic_guid, nt.notification_topic_name
FROM notification n
LEFT JOIN notification_topic nt ON nt.notification_guid = n.notification_guid
LEFT JOIN notification_settings ns ON ns.subscriber_guid = n.subscriber_guid
WHERE ns.notification_token <> '' AND n.active_ind = 'Y'
  AND nt.notification_topic_name = 'BCWS_ActiveFires_PublicView'
  AND ST_INTERSECTS(n.point_geom_buffered, :point_geom)
  AND n.subscriber_guid > 'sub-00500000'
ORDER BY n.subscriber_guid, n.notification_guid
LIMIT 1000;
