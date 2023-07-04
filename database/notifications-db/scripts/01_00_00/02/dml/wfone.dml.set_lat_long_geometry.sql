
UPDATE public.notification SET point_geom = ST_SetSRID(ST_MakePoint(longitude::double precision, latitude::double precision), 4326);

UPDATE public.notification SET point_geom_buffered = ST_BUFFER(Geography(ST_MakePoint(longitude::double precision, latitude::double precision)), radius_kms*1000)::Geometry;