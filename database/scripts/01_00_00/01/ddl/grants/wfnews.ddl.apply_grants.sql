
GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."file_attachment" TO "app_wf1_news_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."file_attachment_metadata" TO "app_wf1_news_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."file_attachment_sequence" TO "app_wf1_news_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."file_attachment_type_code" TO "app_wf1_news_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."related_file_attach_xref" TO "app_wf1_news_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."source_object_name_code" TO "app_wf1_news_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."news_publication_status_code" TO "app_wf1_news_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."external_uri" TO "app_wf1_news_rest_proxy";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."published_incident_detail" TO "app_wf1_news_rest_proxy";


GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."file_attachment" TO "app_wf1_news_custodian";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."file_attachment_metadata" TO "app_wf1_news_custodian";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."file_attachment_sequence" TO "app_wf1_news_custodian";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."file_attachment_type_code" TO "app_wf1_news_custodian";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."related_file_attach_xref" TO "app_wf1_news_custodian";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."source_object_name_code" TO "app_wf1_news_custodian";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."news_publication_status_code" TO "app_wf1_news_custodian";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."external_uri" TO "app_wf1_news_custodian";

GRANT SELECT, INSERT, UPDATE, DELETE ON "wfnews"."published_incident_detail" TO "app_wf1_news_custodian";

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "wfnews" TO "app_wf1_news_rest_proxy";