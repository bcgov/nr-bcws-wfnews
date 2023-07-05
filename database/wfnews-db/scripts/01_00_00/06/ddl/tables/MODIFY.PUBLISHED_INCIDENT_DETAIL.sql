-- Add Fire Centre Name, alter the Fire Centre to Fire Centre Code
ALTER TABLE "wfnews"."published_incident_detail"
DROP CONSTRAINT "pubincdtl_uk";

ALTER TABLE "wfnews"."published_incident_detail"
ADD CONSTRAINT "pubincdtl_uk" UNIQUE("incident_guid");
