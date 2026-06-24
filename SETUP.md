# DRAWN — What you need to do (in order)

Everything below requires you to do it manually.
Code is done. App is deployed to GitHub Pages.

---

## STEP 1 — Create your `.env` file

On your Mac, inside the `Drawn` folder, create a file called `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://eqaltlwngsmomlwbkqzu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxYWx0bHduZ3Ntb21sd2JrcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTA2NzUsImV4cCI6MjA5NzI4NjY3NX0.zcwgXht0vKkkQcu3cVHe4v3q5xv-37BV1GFnwXOGBQY
```

> These are already hardcoded as fallbacks in the app, so this step just makes it cleaner.

---

## STEP 2 — Set up your Supabase database (run SQL files)

Go to: **https://supabase.com/dashboard** → your project → **SQL Editor**

Run each file below **in this exact order**. Click "New query", paste the contents, click "Run".

1. `supabase/schema.sql` — creates all the main tables
2. `supabase/schema_additions.sql` — adds winner fields, wallet function, seller applications
3. `supabase/migration_seller_applications.sql` — seller applications table (safe if already exists)
4. `supabase/kyc_submissions.sql` — identity verification table
5. `supabase/draw_qa.sql` — Q&A comments on draws
6. `supabase/draw_shipments.sql` — tracks when sellers ship items
7. `supabase/draw_deliveries.sql` — tracks when winners receive items
8. `supabase/security_fixes.sql` — RLS policies and security rules
9. `supabase/handle_check_rpc.sql` — function that checks if a username is available
10. `supabase/draw_watches.sql` — lets users save/watch draws
11. `supabase/profile_columns.sql` — adds preference columns to user profiles
12. `supabase/schema_missing_columns.sql` — fills in any missing columns

> Every file uses `IF NOT EXISTS` so it's safe to re-run if something fails.

---

## STEP 3 — Configure Supabase Auth redirect URLs

Go to: **Supabase Dashboard** → **Authentication** → **URL Configuration**

Set **Site URL** to:
```
https://yoniaibi.github.io/Drawn/webapp
```

Add these to **Redirect URLs** (click Add URL for each):
```
https://yoniaibi.github.io/Drawn/webapp/
drawn://
https://drawn.app/
```

---

## STEP 4 — Deploy the draw engine (Edge Function)

This is the code that runs draws automatically every night at 9pm.

On your Mac, in Terminal, inside the `Drawn` folder:

```bash
# Install Supabase CLI if you don't have it
brew install supabase/tap/supabase

# Log in
supabase login

# Link to your project (get the project ref from Supabase Dashboard → Settings → General)
supabase link --project-ref eqaltlwngsmomlwbkqzu

# Deploy the edge function
supabase functions deploy run-draws

# Set the secret (make up any long random string — save it somewhere)
supabase secrets set DRAW_ENGINE_SECRET=your-random-secret-here
```

---

## STEP 5 — Enable the 9pm cron job

Go to **Supabase Dashboard** → **SQL Editor** → **New query**

Paste this (replace `YOUR_DRAW_SECRET` with the secret you set in Step 4):

```sql
select cron.schedule(
  'run-draws-9pm',
  '0 21 * * *',
  $$
  select net.http_post(
    url     := 'https://eqaltlwngsmomlwbkqzu.supabase.co/functions/v1/run-draws',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-draw-secret', 'YOUR_DRAW_SECRET'
    ),
    body    := '{}'::jsonb
  ) as request_id;
  $$
);
```

To verify it was set up: `select * from cron.job;`

---

## STEP 6 — Delete test accounts (optional but recommended)

Go to **Supabase Dashboard** → **Authentication** → **Users**

Delete any test accounts you created during development before going live.

---

## STEP 7 — Apple Developer setup (for iOS app)

You need an Apple Developer account ($99/year at developer.apple.com).

1. Go to **developer.apple.com** → Certificates, Identifiers & Profiles
2. Create a new **App ID** with bundle identifier: `app.drawn.ios`
3. Enable **Associated Domains** capability on that App ID
4. Upload the `apple-app-site-association` file to `https://drawn.app/.well-known/apple-app-site-association` — content:
   ```json
   {
     "applinks": {
       "apps": [],
       "details": [{ "appID": "YOURTEAMID.app.drawn.ios", "paths": ["*"] }]
     }
   }
   ```
   (Replace `YOURTEAMID` with your 10-character Apple Team ID from developer.apple.com)

---

## STEP 8 — Build and submit to App Store

On your Mac, in Terminal, inside the `Drawn` folder:

```bash
# Install EAS CLI if you don't have it
npm install -g eas-cli

# Log in to Expo
eas login

# Build for iOS (first time takes 15-20 mins, builds in the cloud)
eas build --platform ios --profile production

# Submit to App Store (you need an Apple ID with App Store Connect access)
eas submit --platform ios
```

> EAS will walk you through entering your Apple credentials the first time.

---

## STEP 9 — Build for Android (optional)

```bash
# Build Android APK/AAB
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

> You need a Google Play Developer account ($25 one-time) and to create the app in Play Console first.

---

## That's it.

The web app is already live at: **https://yoniaibi.github.io/Drawn/webapp/**

Start with Steps 1-5 (database + auth + draw engine) — those make the app actually functional. Steps 7-9 are when you're ready to put it in the App Store.
