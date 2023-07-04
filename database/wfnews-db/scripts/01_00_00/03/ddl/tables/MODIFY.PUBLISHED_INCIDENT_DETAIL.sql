-- Add FIre Centre, Fire Year, and declared Out
ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "fire_centre" VARCHAR(120);
COMMENT ON COLUMN "wfnews"."published_incident_detail"."fire_centre" IS 'fire_centre is the fire centre of the incident'
;

ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "fire_year" numeric(4);
COMMENT ON COLUMN "wfnews"."published_incident_detail"."fire_year" IS 'fire_year is the year of the incident'
;

ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "declared_out_date" timestamp;
COMMENT ON COLUMN "wfnews"."published_incident_detail"."declared_out_date" IS 'declared_out_date is the date the incident was resolved'
;

CREATE INDEX "pubincdtl_fire_centre_idx" ON "wfnews"."published_incident_detail" USING btree("fire_centre")
;

CREATE INDEX "pubincdtl_soc_idx" ON "wfnews"."published_incident_detail" USING btree("stage_of_control_code")
;

CREATE INDEX "pubincdtl_name_idx" ON "wfnews"."published_incident_detail" USING btree("incident_name")
;
