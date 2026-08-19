-- The DEFAULT marks every existing row sent without a table rewrite, then goes away so a
-- new row starts null. push_timestamp cannot serve: it is NOT NULL DEFAULT current_timestamp.
ALTER TABLE notification_push_item ADD COLUMN sent_timestamp TIMESTAMP DEFAULT current_timestamp;
ALTER TABLE notification_push_item ALTER COLUMN sent_timestamp DROP DEFAULT;

-- Denormalised from notification, so the page cursor stays an index condition. Nullable:
-- pre-existing rows are already marked sent and are never read again.
ALTER TABLE notification_push_item ADD COLUMN subscriber_guid VARCHAR(64);

-- Partial: it holds unsent rows only, and the send pass empties it as it goes.
CREATE INDEX notification_push_item_unsent_idx
  ON notification_push_item (item_identifier, subscriber_guid, notification_push_item_guid)
  WHERE sent_timestamp IS NULL;
