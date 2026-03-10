DELETE FROM "wfnews"."situation_report"
WHERE ctid NOT IN (
    SELECT max(ctid)
    FROM "wfnews"."situation_report"
    GROUP BY report_guid
);
