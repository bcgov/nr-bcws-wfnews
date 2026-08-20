-- Measures the corrected audience read: materialiseAudience, then claimPushItems.
--
-- Run 01_schema.sql and 02_seed.sql first. It needs no function from 03_drain.sql.

\timing on

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- materialiseAudience, exactly as NotificationPushItemMapper.xml writes it.
CREATE OR REPLACE FUNCTION materialise_audience(p_topic text, p_geom geometry, p_item_identifier text)
RETURNS TABLE(rows_written bigint, millis numeric) AS $$
DECLARE
  v_written bigint;
  v_started timestamptz := clock_timestamp();
BEGIN
  INSERT INTO notification_push_item
  ( notification_push_item_guid, notification_guid, subscriber_guid, push_timestamp,
    item_expiry_timestamp, item_identifier, revision_count, create_user, create_timestamp,
    update_user, update_timestamp )
  SELECT uuid_generate_v1(), n.notification_guid, n.subscriber_guid, current_timestamp,
         current_timestamp + interval '24 hours', p_item_identifier, 1,
         current_user, current_timestamp, current_user, current_timestamp
  FROM public.notification n
  JOIN public.notification_settings ns ON ns.subscriber_guid = n.subscriber_guid
  WHERE n.active_ind = 'Y'
    AND ns.notification_token != ''
    AND ST_INTERSECTS(n.point_geom_buffered, p_geom)
    AND EXISTS (
      SELECT 1 FROM public.notification_topic nt
      WHERE nt.notification_guid = n.notification_guid
        AND nt.notification_topic_name = p_topic
    )
  ON CONFLICT (notification_guid, item_identifier) DO NOTHING;

  GET DIAGNOSTICS v_written = ROW_COUNT;

  RETURN QUERY SELECT v_written,
    round((extract(epoch FROM (clock_timestamp() - v_started)) * 1000)::numeric, 1);
END;
$$ LANGUAGE plpgsql;

-- claimPushItems. The cursor is the last row of the page, and not the maximum of each
-- column: a composite of two maximums can step over a row.
CREATE OR REPLACE FUNCTION drain_work_list(p_item_identifier text, p_page_size int)
RETURNS TABLE(pages bigint, rows_read bigint, millis numeric) AS $$
DECLARE
  v_after_sub text := '';
  v_after_guid text := '';
  v_pages bigint := 0;
  v_rows bigint := 0;
  v_page_rows bigint;
  v_started timestamptz := clock_timestamp();
BEGIN
  LOOP
    WITH claimed AS (
      UPDATE notification_push_item npi
      SET sent_timestamp = current_timestamp,
          update_timestamp = current_timestamp
      WHERE npi.notification_push_item_guid IN (
        SELECT c.notification_push_item_guid
        FROM notification_push_item c
        WHERE c.item_identifier = p_item_identifier
          AND c.sent_timestamp IS NULL
          AND (c.subscriber_guid, c.notification_push_item_guid) > (v_after_sub, v_after_guid)
        ORDER BY c.subscriber_guid, c.notification_push_item_guid
        LIMIT p_page_size
        FOR UPDATE SKIP LOCKED
      )
      RETURNING npi.notification_push_item_guid, npi.notification_guid, npi.subscriber_guid
    ), page AS (
      SELECT claimed.notification_push_item_guid AS push_item_guid,
             claimed.subscriber_guid AS subscriber_guid,
             n.notification_name,
             NULLIF(btrim(n.longitude), '')::double precision AS longitude,
             NULLIF(btrim(n.latitude), '')::double precision AS latitude,
             n.radius_kms,
             ns.notification_token
      FROM claimed
      JOIN public.notification n ON n.notification_guid = claimed.notification_guid
      JOIN public.notification_settings ns ON ns.subscriber_guid = claimed.subscriber_guid
      ORDER BY claimed.subscriber_guid, claimed.notification_push_item_guid
    )
    SELECT count(*),
           (array_agg(subscriber_guid ORDER BY subscriber_guid DESC, push_item_guid DESC))[1],
           (array_agg(push_item_guid ORDER BY subscriber_guid DESC, push_item_guid DESC))[1]
    INTO v_page_rows, v_after_sub, v_after_guid
    FROM page;

    EXIT WHEN v_page_rows = 0;

    v_pages := v_pages + 1;
    v_rows := v_rows + v_page_rows;
  END LOOP;

  RETURN QUERY SELECT v_pages, v_rows,
    round((extract(epoch FROM (clock_timestamp() - v_started)) * 1000)::numeric, 1);
END;
$$ LANGUAGE plpgsql;


DELETE FROM notification_push_item WHERE item_identifier IN ('measure-point-fire', 'measure-evac-order');

\echo '=== A point fire near Kelowna ==='

SELECT * FROM materialise_audience('BCWS_ActiveFires_PublicView',
  ST_SetSRID(ST_MakePoint(-119.4960, 49.8880), 4326), 'measure-point-fire');

-- A second delivery of the same event must write no row.
SELECT * FROM materialise_audience('BCWS_ActiveFires_PublicView',
  ST_SetSRID(ST_MakePoint(-119.4960, 49.8880), 4326), 'measure-point-fire');

SELECT * FROM drain_work_list('measure-point-fire', 1000);

\echo '=== An Evacuation Order over the Okanagan ==='

SELECT * FROM materialise_audience('Evacuation Orders and Alerts',
  ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
    'LINESTRING(-120.6 49.2, -118.6 49.2, -118.6 50.6, -120.6 50.6, -120.6 49.2)')), 4326),
  'measure-evac-order');

SELECT * FROM drain_work_list('measure-evac-order', 1000);

\echo '=== The Page cursor is an index condition, and not a filter ==='

EXPLAIN (ANALYZE, BUFFERS)
SELECT c.notification_push_item_guid
FROM notification_push_item c
WHERE c.item_identifier = 'measure-evac-order'
  AND c.sent_timestamp IS NULL
  AND (c.subscriber_guid, c.notification_push_item_guid) > ('sub-00500000', '')
ORDER BY c.subscriber_guid, c.notification_push_item_guid
LIMIT 1000;
