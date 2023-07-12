/* Create Tables */

CREATE TABLE "public"."report_of_fire_attachment_cache"
(
  "report_of_fire_attachment_cache_guid" VARCHAR(36) NOT NULL,   
  "report_of_fire_cache_guid" VARCHAR(36) NOT NULL,  
  "attachment" bytea NOT NULL
);

/* Create Comments, Sequences and Triggers for Autonumber Columns */

COMMENT ON TABLE "public"."report_of_fire_attachment_cache" IS 'report_of_fire_attachment_cache is used to cache Report of Fire photos that are submitted with a ROF form via Public Mobile. '
;

COMMENT ON COLUMN "public"."report_of_fire_attachment_cache"."report_of_fire_attachment_cache_guid" IS 'report_of_fire_attachment_cache_guid is a unique value that identifies a report of fire attachment cache record.'
;

COMMENT ON COLUMN "public"."report_of_fire_attachment_cache"."report_of_fire_cache_guid" IS 'report_of_fire_cache_guid is a unique value that identifies a report of fire cache record.'
;

COMMENT ON COLUMN "public"."report_of_fire_attachment_cache"."attachment" IS 'report_of_fire is used to store a binary attachments such as a photo that are submitted with a report of fire form.'
;

/* Create Primary Keys, Indexes, Uniques, Checks, Triggers */

ALTER TABLE "public"."report_of_fire_attachment_cache" 
 ADD CONSTRAINT "rofac_pk"
  PRIMARY KEY ("report_of_fire_attachment_cache_guid") 
;

CREATE INDEX "rofac_rofc_idx"   
 ON "public"."report_of_fire_attachment_cache" ("report_of_fire_cache_guid")
;

/* Create Foreign Key Constraints */

ALTER TABLE "public"."report_of_fire_attachment_cache" 
 ADD CONSTRAINT "rofac_rofc_fk"
  FOREIGN KEY ("report_of_fire_cache_guid") REFERENCES "public"."report_of_fire_cache" ("report_of_fire_cache_guid")
;