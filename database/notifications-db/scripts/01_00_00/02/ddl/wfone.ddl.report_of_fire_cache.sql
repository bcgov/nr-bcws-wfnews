/* Create Tables */

CREATE TABLE "public"."report_of_fire_cache"
(
  "report_of_fire_cache_guid" VARCHAR(36) NOT NULL,   
  "report_of_fire" TEXT NOT NULL,  
  "submitted_timestamp" TIMESTAMP(6) NOT NULL    
);

/* Create Comments, Sequences and Triggers for Autonumber Columns */

COMMENT ON TABLE "public"."report_of_fire_cache" IS 'report_of_fire_cache is used to cache Report of Fire forms that are submitted from Public Mobile to the Report Of Fire System. '
;

COMMENT ON COLUMN "public"."report_of_fire_cache"."report_of_fire_cache_guid" IS 'report_of_fire_cache_guid is a unique value that identifies a report of fire cache record.'
;

COMMENT ON COLUMN "public"."report_of_fire_cache"."report_of_fire" IS 'report_of_fire is used to store a JSON representation of the Report of Fire form.'
;

COMMENT ON COLUMN "public"."report_of_fire_cache"."submitted_timestamp" IS 'submitted_timestamp is the date and time the Report Of Fire was submitted from Public Mobile.'
;

/* Create Primary Keys, Indexes, Uniques, Checks, Triggers */

ALTER TABLE "public"."report_of_fire_cache" 
 ADD CONSTRAINT "rofc_pk"
  PRIMARY KEY ("report_of_fire_cache_guid") 
;
