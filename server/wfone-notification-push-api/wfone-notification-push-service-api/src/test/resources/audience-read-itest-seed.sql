-- The seed for AudienceReadIntegrationTest. It needs the notification schema, either
-- from audience-read-itest-schema.sql or from a Liquibase built database.

DELETE FROM notification_push_item;
DELETE FROM notification_topic;
DELETE FROM notification;
DELETE FROM notification_settings;

-- ---------------------------------------------------------------- the seed
-- The event is a point fire at -120.0, 50.0. Every filter of the materialise pass gets
-- one subscriber that it must remove.

INSERT INTO notification_settings (subscriber_guid, subscriber_token, notification_token, create_user, update_user)
VALUES
	('sub-1', 'st-1', 'token-1', 'seed', 'seed'),
	('sub-2', 'st-2', 'token-2', 'seed', 'seed'),
	('sub-3', 'st-3', 'token-3', 'seed', 'seed'),
	('sub-4', 'st-4', '',        'seed', 'seed'),
	('sub-5', 'st-5', 'token-5', 'seed', 'seed'),
	('sub-6', 'st-6', 'token-6', 'seed', 'seed'),
	('sub-7', 'st-7', 'token-7', 'seed', 'seed');

INSERT INTO notification (notification_guid, subscriber_guid, notification_name, longitude, latitude, radius_kms, active_ind, create_user, update_user)
VALUES
	-- sub-1 has three saved locations near the event. Item 1.8 collapses them to one push.
	-- The nearest is "Near cabin", and it is not first in guid order.
	('n-1-far',  'sub-1', 'Far cabin',   '-120.30', '50.00', 50, 'Y', 'seed', 'seed'),
	('n-1-mid',  'sub-1', 'Mid cabin',   '-120.15', '50.00', 50, 'Y', 'seed', 'seed'),
	('n-1-near', 'sub-1', 'Near cabin',  '-120.01', '50.00', 50, 'Y', 'seed', 'seed'),
	-- sub-2 has one saved location near the event.
	('n-2',      'sub-2', 'Kelowna',     '-120.05', '50.02', 50, 'Y', 'seed', 'seed'),
	-- sub-3 is far away. The spatial query must not match it.
	('n-3',      'sub-3', 'Prince Rupert', '-130.32', '54.31', 10, 'Y', 'seed', 'seed'),
	-- sub-4 has no device token.
	('n-4',      'sub-4', 'No token',    '-120.02', '50.00', 50, 'Y', 'seed', 'seed'),
	-- sub-5 turned the saved location off.
	('n-5',      'sub-5', 'Turned off',  '-120.02', '50.00', 50, 'N', 'seed', 'seed'),
	-- sub-6 watches a different topic.
	('n-6',      'sub-6', 'Other topic', '-120.02', '50.00', 50, 'Y', 'seed', 'seed'),
	-- sub-7 sorts last, and has two saved locations. A page of five cuts it in half, so it
	-- is the subscriber that must cross a page boundary and still get one push.
	('n-7-a',    'sub-7', 'Lake lot',    '-120.03', '50.01', 50, 'Y', 'seed', 'seed'),
	('n-7-b',    'sub-7', 'Town house',  '-120.04', '50.03', 50, 'Y', 'seed', 'seed');

INSERT INTO notification_topic (notification_topic_guid, notification_guid, notification_topic_name, create_user, update_user)
VALUES
	('t-1-far',  'n-1-far',  'BCWS_ActiveFires_PublicView', 'seed', 'seed'),
	('t-1-mid',  'n-1-mid',  'BCWS_ActiveFires_PublicView', 'seed', 'seed'),
	('t-1-near', 'n-1-near', 'BCWS_ActiveFires_PublicView', 'seed', 'seed'),
	('t-2',      'n-2',      'BCWS_ActiveFires_PublicView', 'seed', 'seed'),
	('t-3',      'n-3',      'BCWS_ActiveFires_PublicView', 'seed', 'seed'),
	('t-4',      'n-4',      'BCWS_ActiveFires_PublicView', 'seed', 'seed'),
	('t-5',      'n-5',      'BCWS_ActiveFires_PublicView', 'seed', 'seed'),
	-- A second topic row for one saved location. The EXISTS must not make a second work
	-- list row out of it.
	('t-2-b',    'n-2',      'Evacuation_Orders_and_Alerts', 'seed', 'seed'),
	('t-6',      'n-6',      'Evacuation_Orders_and_Alerts', 'seed', 'seed'),
	('t-7-a',    'n-7-a',    'BCWS_ActiveFires_PublicView', 'seed', 'seed'),
	('t-7-b',    'n-7-b',    'BCWS_ActiveFires_PublicView', 'seed', 'seed');

ANALYZE notification;
