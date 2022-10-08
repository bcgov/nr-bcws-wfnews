-- Add latitude, longitude, and Geometry columns
ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "latitude" VARCHAR(64) DEFAULT 'N' NOT NULL;
COMMENT ON COLUMN "wfnews"."published_incident_detail"."latitude" IS 'LATITUDE is the latitude of the incident'
;

ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "longitude" VARCHAR(64) DEFAULT 'N' NOT NULL;
COMMENT ON COLUMN "wfnews"."published_incident_detail"."longitude" IS 'LONGITUDE is the longitude of the incident'
;

ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "geometry" geometry(Point,4236);
COMMENT ON COLUMN "wfnews"."published_incident_detail"."geometry" IS 'GEOMETRY is the geometry representation of the incidents latitude and longitude, using projection 4326'
;

--Create index based on point geometry
CREATE INDEX "pubincdtl_point_geom_idx" ON "wfnews"."published_incident_detail" USING gist("geometry")
; 

--Create index based on geography of point
CREATE INDEX "pubincdtl_point_geog_idx" ON "wfnews"."published_incident_detail" USING gist(geography("geometry"))
;

--Create Function for trigger that sets the point_geom and point_geom_buffered columns
CREATE OR REPLACE FUNCTION set_incident_geometries()
  RETURNS trigger 
  LANGUAGE PLPGSQL AS
'
BEGIN
  IF ((NEW.latitude IS NOT NULL) AND (NEW.longitude IS NOT NULL)) THEN
    --Set Point Geometery
    New.geometry = ST_SetSRID(ST_MakePoint(NEW.longitude::double precision, NEW.latitude::double precision), 4326);
  END IF;
  RETURN NEW;
END;
';

--Create trigger that will set geometry columns before notification record is inserted or updated.
DROP TRIGGER IF EXISTS "incident_changes" ON "wfnews"."published_incident_detail";

CREATE TRIGGER "incident_changes"
  BEFORE INSERT OR UPDATE 
  OF longitude, latitude
  ON wfnews.published_incident_detail
  FOR EACH ROW
  EXECUTE PROCEDURE set_incident_geometries();
  
ANALYZE "wfnews"."published_incident_detail";
