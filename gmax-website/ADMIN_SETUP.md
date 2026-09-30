# G-MAX Admin Publish System

The admin dashboard is now connected to a secure server-side publish API.

## What it does

- Admin login with an HTTP-only signed session cookie.
- Edit website content without editing code.
- Save a local draft.
- Preview the draft at `index.html?preview=1`.
- Publish changes to `gmax-website/data/content.json`.
- Keep the previous published content in `data/content.backup.json`.
- Browse published version history from GitHub through the Admin dashboard.
- Restore any available published content version from the Admin dashboard.
- Automatically back up the current live version before every historical restore.
- Public pages load their content from the published JSON.
- The GitHub token is used only by the server API and is never placed in browser code.

## Required deployment

The easiest deployment is Vercel with **Root Directory = `gmax-website`**. The `api/` directory is then deployed as serverless functions and the HTML/CSS/JS files are served as the public site.

The same code can be adapted to another serverless host later.

## Environment variables

Set these server-side environment variables:

- `ADMIN_USERNAME` — admin login username.
- `ADMIN_PASSWORD` — strong admin password.
- `SESSION_SECRET` — long random secret used to sign login sessions.
- `GITHUB_TOKEN` — GitHub token with permission to read and write repository contents.
- `GITHUB_REPO` — optional; defaults to `orivonatech/gmax`.
- `GITHUB_BRANCH` — optional; defaults to `main`.
- `SUPABASE_URL` — optional; when paired with the service-role key, leads and analytics use Supabase/Postgres instead of GitHub JSON.
- `SUPABASE_SERVICE_ROLE_KEY` — optional server-only Supabase service-role key. Never expose it to browser code.

Never put `GITHUB_TOKEN`, `ADMIN_PASSWORD`, or `SESSION_SECRET` in HTML, JavaScript, `content.json`, or any public file.

## Production database storage

Phase 7 adds a database-ready storage adapter. The public lead form and Admin Leads/Analytics APIs keep the same URLs and behavior. If both Supabase variables are configured, new leads and analytics events are stored in Supabase; otherwise the existing GitHub JSON storage remains the safe fallback.

Before enabling Supabase storage, run `data/supabase.schema.sql` in the Supabase SQL editor. Keep the service-role key only in Vercel/server environment variables. Existing GitHub JSON records are not automatically deleted or overwritten by this change.

## First-time setup

1. Deploy the `gmax-website` directory to the hosting provider.
2. Add the environment variables above.
3. Open `/admin.html`.
4. Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
5. Edit a harmless test value.
6. Click **Save Draft**.
7. Click **Preview** to review the draft.
8. Click **Publish Changes**.
9. Confirm that the public page displays the published value.
10. If necessary, use **Version History** to review published versions and restore a selected version. **Revert Published** remains available as a quick previous-version recovery.

## GitHub token recommendation

Use a fine-grained GitHub token restricted to this repository and grant only the repository-content permissions needed for the publish API. Do not use a token with unnecessary organization-wide access.

## Important

Publishing commits the content JSON to the configured branch. If the website host automatically deploys from GitHub, the content becomes live after that deployment completes. On a host serving the repository directly, the new JSON is available immediately.

The public site does not use admin drafts. Only the **Preview** URL reads the admin's local draft from that browser.
