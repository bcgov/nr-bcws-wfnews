CREATE SEQUENCE IF NOT EXISTS "wfnews"."file_attachment_sequence"
  INCREMENT BY 1
  MINVALUE 1
  NO MAXVALUE
  START WITH 1
  CACHE 10
  OWNED BY "wfnews"."file_attachment_sequence"."file_attachment_sequence";
