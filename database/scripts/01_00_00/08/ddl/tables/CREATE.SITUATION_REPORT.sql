-- Create Situation Report Table
CREATE TABLE "wfnews"."situation_report"
(
  "report_guid" varchar(36) NOT NULL,
  "incident_team_count" decimal(10) NOT NULL DEFAULT 0,
  "crew_count" decimal(10) NOT NULL DEFAULT 0,
  "aviation_count" decimal(10) NOT NULL DEFAULT 0,
  "heavy_equipment_count" decimal(10) NOT NULL DEFAULT 0,
  "structure_protection_count" decimal(10) NOT NULL DEFAULT 0,
  "situation_overview" text NULL,
  "situation_report_date" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "published_ind" varchar(1) NOT NULL DEFAULT 'N',
  "archived_ind" varchar(1)  NOT NULL DEFAULT 'N',
  "created_timestamp" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revision_count" decimal(10) NOT NULL DEFAULT 0,
  "create_user" varchar(64)  NOT NULL,
  "create_date" timestamp NOT NULL DEFAULT current_date,
  "update_user" varchar(64)  NOT NULL,
  "update_date" timestamp NOT NULL DEFAULT current_date 
);

/* Create Table Comments, Sequences for Autonumber Columns */

COMMENT ON TABLE "wfnews"."situation_report"
  IS 'Used to store the BCWS Situation Report. This is a text report, and includes resource counts.';

COMMENT ON COLUMN "wfnews"."situation_report"."report_guid"
  IS 'REPORT_GUID is a unique identifier for the record.'
;

COMMENT ON COLUMN "wfnews"."situation_report"."incident_team_count"
  IS 'Count of incident teams.'
;

COMMENT ON COLUMN "wfnews"."situation_report"."crew_count"
  IS 'Count of Firefighting crews'
;

COMMENT ON COLUMN "wfnews"."situation_report"."aviation_count"
  IS 'Count of aciation crews'
;

COMMENT ON COLUMN "wfnews"."situation_report"."heavy_equipment_count"
  IS 'Count of heavy equipment units'
;

COMMENT ON COLUMN "wfnews"."situation_report"."structure_protection_count"
  IS 'Count of structure protection units'
;

COMMENT ON COLUMN "wfnews"."situation_report"."situation_overview"
  IS 'The Situation overview report. This is a text blob stored with HTML styling embedded'
;

COMMENT ON COLUMN "wfnews"."situation_report"."situation_report_date"
  IS 'The date the situation report was published'
;

COMMENT ON COLUMN "wfnews"."situation_report"."published_ind"
  IS 'Y or N indicator identifying if the situation report can be displayed to the public'
;

COMMENT ON COLUMN "wfnews"."situation_report"."archived_ind"
  IS 'Y or N indicator identifying if the situation report has been archived and will no longer be displayed'
;

COMMENT ON COLUMN "wfnews"."situation_report"."created_timestamp"
  IS 'Metadata timestamp indicating when the report was created'
;

COMMENT ON COLUMN "wfnews"."situation_report"."revision_count"
  IS 'REVISION_COUNT is the number of times that the row of data has been changed. The column is used for optimistic locking via application code.'
;

COMMENT ON COLUMN "wfnews"."situation_report"."create_user"
  IS 'CREATE_USER is an audit column that indicates the user that created the record.'
;

COMMENT ON COLUMN "wfnews"."situation_report"."create_date"
  IS 'CREATE_DATE is the date and time the row of data was created.'
;

COMMENT ON COLUMN "wfnews"."situation_report"."update_user"
  IS 'UPDATE_USER is an audit column that indicates the user that updated the record.'
;

COMMENT ON COLUMN "wfnews"."situation_report"."update_date"
  IS 'UPDATE_DATE is the date and time the row of data was updated.'
;

/* Grants */

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."situation_report" TO "app_wf1_news_rest_proxy";
GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."situation_report" TO "app_wf1_news_custodian";

/* indexes */

CREATE INDEX "sitrep_date_idx" ON "wfnews"."situation_report" USING btree("situation_date");
CREATE INDEX "sitrep_pub_idx" ON "wfnews"."situation_report" USING btree("published_ind");
CREATE INDEX "sitrep_arch_idx" ON "wfnews"."situation_report" USING btree("archived_ind");