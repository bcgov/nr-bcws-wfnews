-- Add WAS_FIRE_OF_NOTE_IND
ALTER TABLE "wfnews"."published_incident_detail" ADD COLUMN IF NOT EXISTS "was_fire_of_note_ind" varchar(1) NOT NULL DEFAULT 'N';
COMMENT ON COLUMN "wfnews"."published_incident_detail"."was_fire_of_note_ind" IS 'was_fire_of_note_ind is and indicator identifying if this incident was a fire of note previously'
;
