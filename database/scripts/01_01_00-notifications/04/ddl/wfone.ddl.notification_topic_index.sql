-- Makes notification_topic_name an index condition for the EXISTS in materialiseAudience.
CREATE INDEX IF NOT EXISTS notification_topic_guid_name_idx
  ON public.notification_topic (notification_guid, notification_topic_name);

ANALYZE public.notification_topic;
