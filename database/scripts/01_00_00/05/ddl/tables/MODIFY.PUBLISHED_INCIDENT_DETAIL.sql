-- Add Fire Centre Name, alter the Fire Centre to Fire Centre Code
ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "fire_centre_name" VARCHAR(120);
COMMENT ON COLUMN "wfnews"."published_incident_detail"."fire_centre_name" IS 'fire_centre_name is the name of fire centre of the incident'
;

ALTER TABLE "wfnews"."published_incident_detail" RENAME COLUMN "fire_centre" TO "fire_centre_code";
COMMENT ON COLUMN "wfnews"."published_incident_detail"."fire_centre_code" IS 'fire_centre_code is the fire centre code of the incident';

CREATE INDEX "pubincdtl_fire_centre_name_idx" ON "wfnews"."published_incident_detail" USING btree("fire_centre_name")
;
