# Database Setup

Productivity Lab uses PostgreSQL.

## Prerequisites
- Docker (optional, for local dev)
- PostgreSQL client (`psql` or a GUI like DBeaver)

## Local Development (Docker)

1. Start the database:
   ```bash
   docker run --name productivity-lab-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=lab_db -p 5432:5432 -d postgres:15
   ```

2. Run migrations:
   ```bash
   psql -h localhost -U postgres -d lab_db -f db/migrations/001_initial_schema.sql
   ```

## Production (Supabase/RDS)

1. Connect to your remote instance string.
2. Execute the contents of `db/migrations/001_initial_schema.sql` in the SQL Editor.

## Schema Highlights

### Privacy & LGPD
- **Soft Deletes**: `deleted_at` allows "Right to be Forgotten" (anonymization) without breaking integrity immediately.
- **Consent**: `marketing_consent` and `accepted_terms_at` track legal basis for processing.

### Data Model
- **Metric Events**: The core time-series table. It is hybrid:
    - Can link to `metric_definitions` for standard metrics (Focus Score).
    - Can use raw `metric_name` for ad-hoc custom metrics.
- **Sessions**: Distinguishes between *measuring* something (Log) and *doing* something (Session).
- **Insights**: Normalized findings allowing us to query across users (e.g., "Find all users where NSDR improved focus").

### Performance
- Heavy indexing on `(experiment_id, timestamp)` for O(log n) dashboard loads.
- `JSONB` in `metadata` allows schema evolution without migration for integrations (e.g. storing an Oura Ring specific ID).
