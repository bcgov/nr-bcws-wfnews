-- The old column list left out radius_kms, so a radius change kept the old buffer.

DROP TRIGGER IF EXISTS notification_changes ON public.notification;

CREATE TRIGGER notification_changes
  BEFORE INSERT OR UPDATE
  OF longitude, latitude, radius_kms
  ON public.notification
  FOR EACH ROW
  EXECUTE PROCEDURE set_notification_geometries();

-- The next change of this changeset re-runs set_lat_long_geometry.sql to backfill the
-- buffers the old column list missed.
