/* Create Tables */

CREATE TABLE "public"."monitor_process_log"
(
  "monitor_name" VARCHAR(200) NOT NULL,  
  "last_process_timestamp" TIMESTAMP(6) NOT NULL, 
  "etag" VARCHAR(36),    
  "revision_count" NUMERIC(10) DEFAULT 0 NOT NULL,    
  "create_user" VARCHAR(64) NOT NULL,    
  "create_timestamp" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,   
  "update_user" VARCHAR(64) NOT NULL,    
  "update_timestamp" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL    
);

/* Create Comments, Sequences and Triggers for Autonumber Columns */

COMMENT ON TABLE "public"."monitor_process_log" IS 'monitor_process_log is used to track when a monitor last process notifications. '
;

COMMENT ON COLUMN "public"."monitor_process_log"."monitor_name" IS 'monitor_name is the name of the monitor that runs processes.'
;

COMMENT ON COLUMN "public"."monitor_process_log"."last_process_timestamp" IS 'last_process_timestamp is the last date and time a process was run.'
;

COMMENT ON COLUMN "public"."monitor_process_log"."etag" IS 'Etag is a system column that stores a fully formatted GUID or MD5 hash.  The ETag HTTP response header is an identifier for a specific version of a resource. It lets caches be more efficient and save bandwidth, as a web server does not need to resend a full response if the content has not changed. Additionally, etags help prevent simultaneous updates of a resource from overwriting each other ("mid-air collisions").  If the resource at a given URL changes, a new Etag value must be generated. A comparison of them can determine whether two representations of a resource are the same. Etags are therefore similar to fingerprints, and might also be used for tracking purposes by some servers. They might also be set to persist indefinitely by a tracking server.'
;

COMMENT ON COLUMN "public"."monitor_process_log"."revision_count" IS 'REVISION_COUNT is the number of times that the row of data has been changed. The column is used for optimistic locking via application code.'
;

COMMENT ON COLUMN "public"."monitor_process_log"."create_user" IS 'CREATE_USER is an audit column that indicates the user that created the record.'
;

COMMENT ON COLUMN "public"."monitor_process_log"."create_timestamp" IS 'CREATE_TIMESTAMP is the date and time the row of data was created.'
;

COMMENT ON COLUMN "public"."monitor_process_log"."update_user" IS 'UPDATE_USER is an audit column that indicates the user that updated the record.'
;

COMMENT ON COLUMN "public"."monitor_process_log"."update_timestamp" IS 'UPDATE_TIMESTAMP is the date and time the row of data was updated.'
;

/* Create Primary Keys, Indexes, Uniques, Checks, Triggers */

ALTER TABLE "public"."monitor_process_log" 
 ADD CONSTRAINT "mpl_pk"
  PRIMARY KEY ("monitor_name") 
;
