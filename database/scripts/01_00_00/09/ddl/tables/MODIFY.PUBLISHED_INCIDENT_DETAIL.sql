ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "wildfire_crew_resources_count" decimal(5) NULL;
ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "wildfire_aviation_rsrc_count" decimal(5) NULL;
ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "heavy_equipment_rsrc_count" decimal(5) NULL;
ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "incident_mgmnt_crew_rsrc_count" decimal(5) NULL;
ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "structure_protection_rsrc_cnt" decimal(5) NULL;


/* Create Comments, Sequences and Triggers for Autonumber Columns */

COMMENT ON COLUMN "wfnews"."published_incident_detail"."wildfire_crew_resources_count" IS 'Wildfire Crew Resources Count is a count of wildfire crew resources that were deployed to the incident.'
;
COMMENT ON COLUMN "wfnews"."published_incident_detail"."wildfire_aviation_rsrc_count" IS 'Wildfire Aviation Resources Count is a count of aviation resources that were deployed for the incident.'
;
COMMENT ON COLUMN "wfnews"."published_incident_detail"."heavy_equipment_rsrc_count" IS 'Heavy Equipment Resources Count is a count of heavy equipment resources deployed for an incident.'
;
COMMENT ON COLUMN "wfnews"."published_incident_detail"."incident_mgmnt_crew_rsrc_count" IS 'Incident Management Crew Resources Count is a count of incident management team crew resources deployed to an incident.'
;
COMMENT ON COLUMN "wfnews"."published_incident_detail"."structure_protection_rsrc_cnt" IS 'Structure Protection Resources Count is a count of structure protection resources deployed to an incident.'