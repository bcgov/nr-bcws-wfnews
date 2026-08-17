-- Lets the INSERT be the idempotency gate, instead of a check-then-act race.

-- Delete the duplicates first, or the unique index cannot be created. Keep the newest
-- row for each pair, and break a tie on the primary key.
DELETE FROM notification_push_item npi
WHERE npi.item_identifier IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM notification_push_item keep
    WHERE keep.notification_guid = npi.notification_guid
      AND keep.item_identifier = npi.item_identifier
      AND (
        keep.push_timestamp > npi.push_timestamp
        OR (
          keep.push_timestamp = npi.push_timestamp
          AND keep.notification_push_item_guid > npi.notification_push_item_guid
        )
      )
  );

-- item_identifier is nullable, and Postgres treats NULLs as distinct here, so old rows
-- with a null identifier do not collide.
DROP INDEX IF EXISTS notification_push_item_idx;

CREATE UNIQUE INDEX notification_push_item_uk
  ON notification_push_item (notification_guid, item_identifier);

-- For the delete job, which deletes on item_expiry_timestamp.
CREATE INDEX IF NOT EXISTS notification_push_item_expiry_idx
  ON notification_push_item (item_expiry_timestamp);
