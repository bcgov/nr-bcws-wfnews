-- Role: "proxy_wf1_notification_rest"
-- DROP ROLE "proxy_wf1_notification_rest";

CREATE ROLE "proxy_wf1_notification_rest" WITH
  LOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  PASSWORD '*********';

COMMENT ON ROLE "proxy_wf1_notification_rest" IS 'Proxy account for Wildfire Notification System.';