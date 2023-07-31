
GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."monitor_process_log" TO "app_wf1_notification_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."notification" TO "app_wf1_notification_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."notification_push_item" TO "app_wf1_notification_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."notification_settings" TO "app_wf1_notification_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."notification_topic" TO "app_wf1_notification_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."report_of_fire_attachment_cache" TO "app_wf1_notification_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."report_of_fire_cache" TO "app_wf1_notification_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "public"."spatial_ref_sys" TO "app_wf1_notification_rest_proxy";

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "public" TO "app_wf1_notification_rest_proxy";

GRANT SELECT ON "public"."monitor_process_log" TO "app_wf1_notification_custodian";

GRANT SELECT ON "public"."notification" TO "app_wf1_notification_custodian";

GRANT SELECT ON "public"."notification_push_item" TO "app_wf1_notification_custodian";

GRANT SELECT ON "public"."notification_settings" TO "app_wf1_notification_custodian";

GRANT SELECT ON "public"."notification_topic" TO "app_wf1_notification_custodian";

GRANT SELECT ON "public"."report_of_fire_attachment_cache" TO "app_wf1_notification_custodian";

GRANT SELECT ON "public"."report_of_fire_cache" TO "app_wf1_notification_custodian";

GRANT SELECT ON "public"."spatial_ref_sys" TO "app_wf1_notification_custodian";