-- SCHEMA: wfnews

-- DROP SCHEMA "wfnews" ;

CREATE SCHEMA "wfnotification";

GRANT ALL ON SCHEMA "wfnotification" TO "app_wf1_notification";

GRANT USAGE ON SCHEMA "wfnotification" TO "app_wf1_notification_rest_proxy";