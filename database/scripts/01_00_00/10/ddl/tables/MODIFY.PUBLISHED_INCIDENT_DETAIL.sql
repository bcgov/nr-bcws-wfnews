/* index */
CREATE INDEX "pubincdtl_fy_idx" ON "wfnews"."published_incident_detail" USING btree("fire_year");
CREATE INDEX "pubincdtl_ise_idx" ON "wfnews"."published_incident_detail" USING btree("incident_size_estimated_ha");
