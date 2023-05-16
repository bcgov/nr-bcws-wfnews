--Add lat-long point geometry column
ALTER TABLE public.notification ADD COLUMN point_geom geometry(Point, 4326) null;

--Add buffered polygon geometry column
ALTER TABLE public.notification ADD COLUMN point_geom_buffered geometry(Polygon, 4326) NULL;

--Create index based on point geometry
CREATE INDEX notif_point_geom_idx ON public.notification USING gist(point_geom); 

--Create index based on geography of point
CREATE INDEX notif_point_geog_idx ON public.notification USING gist(geography(point_geom)); 

--Create index based on buffered point geometry
CREATE INDEX notif_point_geom_buff_idx ON public.notification USING gist(point_geom_buffered); 

--Create Function for trigger that sets the point_geom and point_geom_buffered columns
CREATE OR REPLACE FUNCTION set_notification_geometries()
  RETURNS trigger 
  LANGUAGE PLPGSQL AS
$$
BEGIN
  IF ((NEW.latitude IS NOT NULL) AND (NEW.longitude IS NOT NULL)) THEN
    --Set Point Geometery
    New.point_geom = ST_SetSRID(ST_MakePoint(NEW.longitude::double precision, NEW.latitude::double precision), 4326);

    --Set Buffered Point Geometry (Polygon)
    New.point_geom_buffered = ST_BUFFER(Geography(ST_MakePoint(NEW.longitude::double precision, NEW.latitude::double precision)), NEW.radius_kms*1000)::Geometry;
  END IF;
  RETURN NEW;
END;
$$;

--Create trigger that will set geometry columns before notification record is inserted or updated.
DROP TRIGGER IF EXISTS notification_changes ON public.notification;

CREATE TRIGGER notification_changes
  BEFORE INSERT OR UPDATE 
  OF longitude, latitude
  ON public.notification  
  FOR EACH ROW
  EXECUTE PROCEDURE set_notification_geometries();
  
ANALYZE notification;  