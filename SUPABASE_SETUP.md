# Supabase Activities Table Setup

The `activities` table needs to be created in your Supabase database. Follow these steps:

## Step 1: Go to Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `lfrfjkfpaamnqqnqeyyi`
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

## Step 2: Create the Activities Table

Copy and paste this SQL code into the SQL Editor:

```sql
-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image TEXT,
  color TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_id ON activities(id);

-- Enable Row Level Security (RLS)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (anyone can view activities)
CREATE POLICY "Allow public read access"
ON activities
FOR SELECT
TO public
USING (true);

-- Create policy to allow public insert (for admin to add activities)
CREATE POLICY "Allow public insert"
ON activities
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy to allow public update (for admin to edit activities)
CREATE POLICY "Allow public update"
ON activities
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Create policy to allow public delete (for admin to delete activities)
CREATE POLICY "Allow public delete"
ON activities
FOR DELETE
TO public
USING (true);
```

## Step 3: Run the SQL

1. Click the **"Run"** button (or press `Ctrl+Enter`)
2. You should see a success message: "Success. No rows returned"

## Step 4: Verify the Table

1. Go to **"Table Editor"** in the left sidebar
2. You should see the `activities` table listed
3. The table should be empty initially

## Step 5: Realtime is Already Enabled! ✅

**Good news:** Supabase Realtime subscriptions are enabled by default for all tables. You don't need to configure anything!

The real-time updates will work automatically once the `activities` table is created. When an admin adds/updates/deletes an activity, all users will see the changes instantly without refreshing.

**Note:** The "Replication" page in Supabase Dashboard is for external data replication (like BigQuery), not for Realtime subscriptions. Our app uses Realtime subscriptions which work automatically.

## Step 6: Test It

1. Refresh your website
2. The 404 errors should be gone
3. Go to admin dashboard and add/edit an activity
4. Check the Supabase Table Editor - you should see the activity appear!
5. Open the website in another browser/incognito window - changes should appear instantly without refresh!

## Troubleshooting

If you get an error about policies already existing:
- Delete the existing policies first, then run the CREATE POLICY statements again
- Or modify the SQL to use `CREATE POLICY IF NOT EXISTS` (if your Supabase version supports it)

If you still get 404 errors after creating the table:
- Make sure you're in the correct Supabase project
- Check that the table name is exactly `activities` (lowercase)
- Refresh your browser and clear cache

## How It Works

- **Images**: Stored in Supabase Storage (bucket: `activity-photos`) ✅ Already working
- **Activities**: Stored in Supabase Database (table: `activities`) ⚠️ Needs to be created
- **Default Activities**: Always shown (Art & Craft Day, Story Time, Sports Day)
- **Supabase Images**: Merged with default activities when viewing details
