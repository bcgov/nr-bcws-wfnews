-- Role: "app_wf1_news"
-- DROP ROLE "app_wf1_news";

CREATE ROLE "app_wf1_news" WITH
  LOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  PASSWORD '*********';

COMMENT ON ROLE "app_wf1_news" IS 'Wildfire News System.';