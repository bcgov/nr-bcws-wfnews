-- SCHEMA: wfnews

-- DROP SCHEMA "wfnews" ;

CREATE SCHEMA "wfnews"
    AUTHORIZATION postgres;

GRANT ALL ON SCHEMA "wfnews" TO "app_wf1_news";

GRANT USAGE ON SCHEMA "wfnews" TO "app_wf1_news_rest_proxy";

GRANT ALL ON SCHEMA "wfnews" TO postgres;