-- Drains the whole audience in pages, the way the Push Worker does, and reports the total.
-- One function for each ordering. The columns match the real query exactly.

-- v1: keyset on notification_guid.
CREATE OR REPLACE FUNCTION drain_v1(p_topic text, p_geom geometry, p_page int)
RETURNS TABLE(pages int, rows_read bigint, ms numeric) AS $$
DECLARE
	cur text := '';
	last_cur text;
	n int;
	t0 timestamptz;
BEGIN
	pages := 0; rows_read := 0;
	t0 := clock_timestamp();
	LOOP
		n := 0;
		FOR last_cur IN
			SELECT n2.notification_guid
			FROM public.notification n2
			LEFT JOIN public.notification_topic nt ON nt.notification_guid = n2.notification_guid
			LEFT JOIN public.notification_settings ns ON ns.subscriber_guid = n2.subscriber_guid
			WHERE ns.notification_token != '' AND n2.active_ind = 'Y'
			  AND nt.notification_topic_name = p_topic
			  AND ST_INTERSECTS(n2.point_geom_buffered, p_geom)
			  AND n2.notification_guid > cur
			ORDER BY n2.notification_guid
			LIMIT p_page
		LOOP
			n := n + 1; cur := last_cur;
		END LOOP;
		EXIT WHEN n = 0;
		pages := pages + 1; rows_read := rows_read + n;
	END LOOP;
	ms := round(extract(epoch FROM clock_timestamp() - t0)::numeric * 1000, 1);
	RETURN NEXT;
END; $$ LANGUAGE plpgsql;

-- v2: a computed distance in the ORDER BY.
CREATE OR REPLACE FUNCTION drain_v2(p_topic text, p_geom geometry, p_page int)
RETURNS TABLE(pages int, rows_read bigint, ms numeric) AS $$
DECLARE
	cur text := '';
	last_cur text;
	n int;
	t0 timestamptz;
BEGIN
	pages := 0; rows_read := 0;
	t0 := clock_timestamp();
	LOOP
		n := 0;
		FOR last_cur IN
			SELECT n2.subscriber_guid
			FROM public.notification n2
			LEFT JOIN public.notification_topic nt ON nt.notification_guid = n2.notification_guid
			LEFT JOIN public.notification_settings ns ON ns.subscriber_guid = n2.subscriber_guid
			WHERE ns.notification_token != '' AND n2.active_ind = 'Y'
			  AND nt.notification_topic_name = p_topic
			  AND ST_INTERSECTS(n2.point_geom_buffered, p_geom)
			  AND n2.subscriber_guid > cur
			ORDER BY n2.subscriber_guid,
			         ST_DistanceSphere(p_geom, ST_SetSRID(ST_MakePoint(n2.longitude::double precision,
			                                                           n2.latitude::double precision), 4326)),
			         n2.notification_guid
			LIMIT p_page
		LOOP
			n := n + 1; cur := last_cur;
		END LOOP;
		EXIT WHEN n = 0;
		pages := pages + 1; rows_read := rows_read + n;
	END LOOP;
	ms := round(extract(epoch FROM clock_timestamp() - t0)::numeric * 1000, 1);
	RETURN NEXT;
END; $$ LANGUAGE plpgsql;

-- v3: two plain columns.
CREATE OR REPLACE FUNCTION drain_v3(p_topic text, p_geom geometry, p_page int)
RETURNS TABLE(pages int, rows_read bigint, ms numeric) AS $$
DECLARE
	cur text := '';
	last_cur text;
	n int;
	t0 timestamptz;
BEGIN
	pages := 0; rows_read := 0;
	t0 := clock_timestamp();
	LOOP
		n := 0;
		FOR last_cur IN
			SELECT n2.subscriber_guid
			FROM public.notification n2
			LEFT JOIN public.notification_topic nt ON nt.notification_guid = n2.notification_guid
			LEFT JOIN public.notification_settings ns ON ns.subscriber_guid = n2.subscriber_guid
			WHERE ns.notification_token != '' AND n2.active_ind = 'Y'
			  AND nt.notification_topic_name = p_topic
			  AND ST_INTERSECTS(n2.point_geom_buffered, p_geom)
			  AND n2.subscriber_guid > cur
			ORDER BY n2.subscriber_guid, n2.notification_guid
			LIMIT p_page
		LOOP
			n := n + 1; cur := last_cur;
		END LOOP;
		EXIT WHEN n = 0;
		pages := pages + 1; rows_read := rows_read + n;
	END LOOP;
	ms := round(extract(epoch FROM clock_timestamp() - t0)::numeric * 1000, 1);
	RETURN NEXT;
END; $$ LANGUAGE plpgsql;
