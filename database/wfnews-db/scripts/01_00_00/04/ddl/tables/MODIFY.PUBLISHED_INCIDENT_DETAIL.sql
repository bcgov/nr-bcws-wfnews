-- Response type
ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "response_type_code" VARCHAR(120);
COMMENT ON COLUMN "wfnews"."published_incident_detail"."response_type_code" IS 'response_type_code is the fire response type from inicident manager';

ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "response_type_detail" VARCHAR(4000);
COMMENT ON COLUMN "wfnews"."published_incident_detail"."response_type_detail" IS 'response_type_detail is the fire response information from inicident manager';

-- indexes for regularly queried fields
CREATE INDEX "pubincdtl_num_lbl_idx" ON "wfnews"."published_incident_detail" USING btree("incident_number_label");
CREATE INDEX "pubincdtl_fnt_idx" ON "wfnews"."published_incident_detail" USING btree("fire_of_note_ind");
