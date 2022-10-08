ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "longitude" VARCHAR(1) DEFAULT 'N' NOT NULL;
COMMENT ON COLUMN "wfnews"."published_incident_detail"."longitude" IS 'LONGITUDE is the longitude of the incident'
;

ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "longitude" VARCHAR(1) DEFAULT 'N' NOT NULL;
COMMENT ON COLUMN "wfnews"."published_incident_detail"."longitude" IS 'LONGITUDE is the longitude of the incident'
;

ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "geometry" geometry(Geometry,4236);
COMMENT ON COLUMN "wfnews"."published_incident_detail"."geometry" IS 'GEOMETRY is the geometry representation of the incidents latitude and longitude, using projection 4326'
;