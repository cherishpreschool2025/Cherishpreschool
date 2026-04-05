# Supabase Health Checks (Cron Logging)

This project has a Vercel Cron job that calls `/api/cron/ping` daily to keep Supabase active.

If you want to **store each ping result in Supabase** (so the Admin Dashboard can show status/history), create the table below.

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Select your project
3. Go to **SQL Editor** → **New query**

## Step 2: Create the `health_checks` table

Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS public.health_checks (
  id BIGSERIAL PRIMARY KEY,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ok BOOLEAN NOT NULL DEFAULT TRUE,
  latency_ms INTEGER,
  primary_ok BOOLEAN,
  primary_status TEXT,
  fallback_ok BOOLEAN,
  fallback_status TEXT,
  source TEXT
);

CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at
  ON public.health_checks (checked_at DESC);

-- Ensure the API roles can read the table (RLS is still enforced separately).
GRANT SELECT ON TABLE public.health_checks TO anon, authenticated;

ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

-- Allow the Admin UI (uses anon key) to read checks.
CREATE POLICY "Allow public read access"
ON public.health_checks
FOR SELECT
TO public
USING (true);

-- If you still see `PGRST205` / schema cache 404s after creating the table, force a schema reload:
NOTIFY pgrst, 'reload schema';
```

## Step 3: Choose how inserts work (pick ONE)

### Option A (recommended): insert from server only (service role)

- Add `SUPABASE_SERVICE_ROLE_KEY` to your Vercel Project → Settings → Environment Variables
- Keep **NO** public insert policy (leave it as-is)

The cron endpoint will use the service role key to insert rows (RLS bypass), and the public anon key can only read.

### Option B: allow public inserts (no service role needed)

If you do not want to use a service role key, you can allow inserts from the public anon key:

```sql
CREATE POLICY "Allow public insert"
ON public.health_checks
FOR INSERT
TO public
WITH CHECK (true);
```

## Notes

- If you set `CRON_SECRET` in Vercel, Vercel will automatically add `Authorization: Bearer <CRON_SECRET>` when invoking the cron job.
- The Admin "Health" tab will show **empty** until at least one cron run is logged.

