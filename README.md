# Static Spark

Automated quote-card pipeline: paste in a text → LLM pulls out quotes → you
approve them → cards get rendered from `card.html` → posted to Facebook,
Instagram and Threads.

```
Vercel dashboard --ingest--> GitHub Actions (Quote Maker, Groq)
                                    |
                                    v
                            Google Sheet (review queue)
                                    |  (you approve rows)
                                    v
                    GitHub Actions cron (Card Maker, ~3/hr)
                          Playwright screenshots card.html
                                    |
                                    v
                         Supabase (storage + `cards` table)
                                    |
                                    v
                  GitHub Actions cron (Post Engine, ~3/hr)
                         FB / IG / Threads Graph API
```

The Vercel dashboard (`dashboard/`) is the control surface: submit text,
approve/reject quotes, browse the card gallery, delete/reorder cards, and
manually trigger the card/post jobs.

## One-time setup

### 1. Supabase
1. Create a project.
2. SQL editor → run `sql/schema.sql`.
3. Storage → create two **public** buckets: `sources` (raw ingested text) and
   `cards` (rendered PNGs).
4. Grab the project URL and the `service_role` key (Settings → API).

### 2. Google Sheet
1. Create a sheet, add header row `quote | author | status | source | created_at`
   in `Sheet1`.
2. Create a Google Cloud service account, enable the Sheets API, download its
   JSON key, and share the sheet with the service account's email (Editor).
3. `GOOGLE_SHEET_ID` is the id in the sheet's URL. `GOOGLE_SERVICE_ACCOUNT_JSON`
   is the full JSON key file contents (single line).

### 3. Groq
Create an API key at console.groq.com → `GROQ_API_KEY`.

### 4. Meta / Threads (you said you already have these)
- `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN`: a Page access token with
  `pages_manage_posts` on the target Page.
- `IG_USER_ID`, `IG_ACCESS_TOKEN`: the IG Business account id linked to that
  Page, same token generally works.
- `THREADS_USER_ID`, `THREADS_ACCESS_TOKEN`: from the Threads API app.

### 5. GitHub repo secrets
Settings → Secrets and variables → Actions, add: `GROQ_API_KEY`,
`GOOGLE_SERVICE_ACCOUNT_JSON`, `GOOGLE_SHEET_ID`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN`,
`IG_USER_ID`, `IG_ACCESS_TOKEN`, `THREADS_USER_ID`, `THREADS_ACCESS_TOKEN`.

### 6. Vercel (dashboard)
Deploy `dashboard/` as the project root. Env vars (see
`dashboard/.env.example`): the same Supabase/Google values above, plus
- `GITHUB_TOKEN`: a fine-grained PAT with Actions read/write and Contents
  read on this repo (used to trigger workflows and read run status).
- `GITHUB_REPO`: `owner/repo`.
- `DASHBOARD_PASSWORD`: shared password gating the whole dashboard.

## Local dev

```
cd dashboard && cp .env.example .env.local && npm run dev
```

```
cd python && pip install -r requirements.txt && playwright install chromium
python quote_maker.py   # needs SOURCE_PATH env pointing at a 'sources' object
python card_maker.py
python post_engine.py
```

## Not built yet (deliberately)

- Retry/backoff on failed social posts — a failed platform is just logged
  and skipped; add if posting flakiness becomes a real problem.
- Chunked long-source handling beyond simple character-count splitting for
  quote extraction — fine unless sources get huge.
