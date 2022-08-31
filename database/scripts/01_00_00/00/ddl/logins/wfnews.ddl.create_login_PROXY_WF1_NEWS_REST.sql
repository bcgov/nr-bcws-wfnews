-- Role: "proxy_wf1_news_rest"
-- DROP ROLE "proxy_wf1_news_rest";

CREATE ROLE "proxy_wf1_news_rest" WITH
  LOGIN
  NOSUPERUSER
  INHERIT
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  PASSWORD '********';

COMMENT ON ROLE "proxy_wf1_news_rest" IS 'Proxy account for Wildfire News System.';