# Audience read harness

**Written in ASD-STE100 Simplified Technical English.**
**Words: see [CONTEXT.md](../../CONTEXT.md).**

This harness measures the **Audience read**: the work that the **Push Worker**
does to get the **Audience** out of the database. It is the evidence for
[AUDIENCE_READ_PLAN_STE.md](../../AUDIENCE_READ_PLAN_STE.md) and for item 1.8 of
[PUSH_NOTIFICATIONS_IMPROVEMENT_PLAN_STE.md](../../PUSH_NOTIFICATIONS_IMPROVEMENT_PLAN_STE.md).

The JMeter suites next to this folder test HTTP only. They do not touch the
notification pipeline.

## What it does

It makes 1,000,000 **Subscribers** with 1,649,922 **Saved Locations**, and then
reads the **Audience** two ways: as one scan, and in **Pages** as the code does
today.

The **Saved Locations** are clustered the way BC population is clustered, and each
**Subscriber** keeps their **Saved Locations** near each other. That is what makes
them overlap, and the overlap is what item 1.8 collapses.

## How to run it

```bash
docker run --name wfnews-perf -e POSTGRES_USER=wfnews -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=wfnews -p 55432:5432 -d --shm-size=1g postgis/postgis:13-3.3

for f in 01_schema.sql 02_seed.sql 03_drain.sql 04_measure.sql; do
  docker cp "$f" wfnews-perf:/tmp/"$f"
  docker exec wfnews-perf psql -U wfnews -d wfnews -f /tmp/"$f"
done
```

On Git Bash for Windows, set `MSYS_NO_PATHCONV=1` first. Without it, Git Bash
changes `/tmp/...` into a Windows path and `psql` cannot find the file.

The seed takes approximately 6 minutes. `04_measure.sql` takes approximately 2
minutes. **The polygon drain is not in `04_measure.sql`, because it takes
approximately 18 minutes.** Run it on its own:

```sql
SELECT * FROM drain_v3('Evacuation Orders and Alerts',
  ST_SetSRID(ST_MakePolygon(ST_GeomFromText(
    'LINESTRING(-120.6 49.2, -118.6 49.2, -118.6 50.6, -120.6 50.6, -120.6 49.2)')), 4326), 1000);
```

| File | What it does |
|---|---|
| `01_schema.sql` | The production schema, copied from `database/scripts/01_00_00-notifications` |
| `02_seed.sql` | 1,000,000 **Subscribers**. The seed is fixed, so two runs give the same rows |
| `03_drain.sql` | Three drain functions, one for each **Page** order that we measured |
| `04_measure.sql` | The **Audience** sizes, the collapse, the drains and the `EXPLAIN` |
| `05_work_list.sql` | The **Materialise pass** and the **Send pass**, after the correction |

`01_schema.sql` to `04_measure.sql` measure the **Re-scan** defect. `05_work_list.sql`
measures the correction, and it takes approximately 45 seconds.

## The numbers we measured

On a `postgis/postgis:13-3.3` container, `--shm-size=1g`, default settings.

### The Audience, and what item 1.8 removes

| Event | **Saved Locations** | **Subscribers** | FCM work removed |
|---|---|---|---|
| A point fire near Kelowna | 53,960 | 42,347 | **21.5%** |
| An **Evacuation Order** over the Okanagan | 330,064 | 204,615 | **38.0%** |

### The cost of the Pages

| Event | One scan | In **Pages** of 1,000 | Penalty |
|---|---|---|---|
| Point fire, 53,960 rows | 1,126 ms | 31,227 ms, 54 **Pages** | **28×** |
| **Evacuation Order**, 330,064 rows | 2,888 ms | 1,058,088 ms, 330 **Pages** | **366×** |

The two agree with a square law to within 10%. Thus 1,000,000 **Recipients**
projects to approximately **3 hours** in the **Audience read** alone.

### The Page order makes no difference

| Order | **Pages** | Time |
|---|---|---|
| `notification_guid` — Part 6 | 54 | 31,227 ms |
| `subscriber_guid`, a computed distance, `notification_guid` | 54 | 33,234 ms |
| `subscriber_guid`, `notification_guid` — item 1.8 | 54 | 31,470 ms |
| The same, with an index on `(subscriber_guid, notification_guid)` | 54 | 31,633 ms |

All within 6%. **An index on the cursor column does not help.** The cost is the
**Re-scan**, not the sort. Do not add that index.

## The correction

`05_work_list.sql` measures the two passes of section 4 of the plan. The **Materialise
pass** writes the **Work List** with one statement. The **Send pass** claims a **Page**
of that table and reads it in one statement.

| Event | Today, in **Pages** | **Materialise pass** | **Send pass** | Total | Faster by |
|---|---|---|---|---|---|
| Point fire, 53,765 rows | 31,227 ms | 4,335 ms | 1,700 ms, 54 **Pages** | **6,035 ms** | **5.2×** |
| **Evacuation Order**, 330,064 rows | 1,058,088 ms | 26,285 ms | 11,698 ms, 331 **Pages** | **37,983 ms** | **27.9×** |

### The square law is gone

The **Evacuation Order** **Audience** is 6.1 times the point fire **Audience**. The
**Re-scan** made it 34 times slower. The correction makes it **6.3 times** slower. That is
linear, and it is the result that matters: the cost now follows the rows.

### Why the Materialise pass is slower than one scan

Section 6.2 of the plan gives a target of approximately 1,200 ms and 3,000 ms. Those are
the **one scan** times, and they measure a read only. The **Materialise pass** also writes
one row for each **Recipient**, keeps three indexes and makes one foreign key check for
each row. On the point fire that is 1,190 ms of scan and approximately 3,100 ms of write.

The write is the price of the checkpoint that item 4.4 wants. It is paid one time for each
**Event**, and not one time for each **Page**.

### The Page cursor

```
Index Only Scan using notification_push_item_unsent_idx
  Index Cond: ((item_identifier = ...) AND (ROW(subscriber_guid, notification_push_item_guid) > ROW(...)))
```

Compare this with section 2 of the plan, where the same cursor was a `Filter` that removed
42,763 rows on every **Page**. One index now supplies the filter and the order together.
One **Page** in the middle of a 330,064 row **Work List** costs approximately 3 ms.

### The partial index fills with dead entries as it drains

The **Send pass** marks a row sent, and the row leaves the partial index. The index entry
stays until a vacuum removes it. Thus a scan of the index late in a drain reads dead
entries. We measured 82 ms for an empty result at the end of a 330,064 row drain.

It does not grow without limit, and the drain stays linear: 331 **Pages** in 11,698 ms is
approximately 35 ms for each **Page**. But it is one more reason for the **Delete Job** of
item 2.2.

## The Java at scale

This harness measures the SQL only. Its drain loop runs **inside** the database, so no row
crosses JDBC and no Java runs.

`AudienceReadScaleTest` measures the same two passes through the **Push Worker**, against
this same container. See section 6.7 of
[AUDIENCE_READ_PLAN_STE.md](../../AUDIENCE_READ_PLAN_STE.md).

```bash
cd ../../server/wfone-notification-push-api
mvn test -Dtest=AudienceReadScaleTest \
  -Dwfnews.scale.jdbcUrl=jdbc:postgresql://localhost:55432/wfnews
```

| Measurement | This harness | Through the Java |
|---|---|---|
| **Materialise pass**, point fire | 4,335 ms | 5,793 ms |
| **Send pass**, point fire | 1,700 ms | 2,496 ms |
| **Materialise pass**, **Evacuation Order** | 26,285 ms | 25,154 ms |

One whole point fire **Event**: 6,169 ms, 42,182 FCM messages, peak heap 40 MB.

**The 1,000,000 target.** A polygon over southern BC matches 1,210,585 **Recipients** and
742,036 **Subscribers**. The **Audience read** takes **94,216 ms**: 52,789 ms to
materialise and 41,427 ms for 1,211 **Pages**. The old paged read projected to
approximately 3 hours at that size.

**Clear `notification_push_item` before you measure.** With 1,036,483 stale rows in it, the
**Materialise pass** for the **Evacuation Order** took 65,464 ms and not 25,154 ms.

```sql
TRUNCATE notification_push_item;
VACUUM ANALYZE notification_push_item;
```

## Caution

These numbers come from a container on a developer machine. They are correct for
**comparison**, which is what the plan uses them for. They are **not** a
prediction of production RDS times. Read the ratios, not the milliseconds.

## When you are finished

```bash
docker rm -f wfnews-perf
```
