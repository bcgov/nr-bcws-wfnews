-- indexes for regularly queried fields

CREATE INDEX "pubincdtl_name_idx" ON "wfnews"."published_incident_detail" USING btree("incident_number_label");
CREATE INDEX "pubincdtl_name_idx" ON "wfnews"."published_incident_detail" USING btree("fire_of_note_ind");
