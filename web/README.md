# ShinyMS Web CMS

Next.js 16 + Prisma web interface for ShinyMS. Provides player rankings, guild leaderboards, boss records, drop search, the community feed, vote tracking, news/announcements with email + Discord broadcasts, a newsletter signup, and an admin panel.

## Prerequisites

- Node.js 20+
- MySQL 8 or MariaDB 11 (same database instance as the game server)

## Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in all values — see table below

# 3. Generate Prisma client
npx prisma generate

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string. Example: `mysql://root:pass@localhost:3306/v83` |
| `NEXTAUTH_SECRET` | Yes | Random secret for session signing. Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Public URL of the web app. Example: `https://shinyms.com` or `http://localhost:3000` in dev |
| `GAME_SERVER_HOST` | Yes | Hostname of the game server for status checks. `localhost` in dev, `maplestory` in Docker |
| `GAME_LOGIN_PORT` | Yes | Game login server port. Default: `8484` |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute base URL for links inside emails (unsubscribe, etc.). Falls back to `NEXTAUTH_URL`, then `https://shinyms.com`. |
| `TOPG_POSTBACK_KEY` | No | Secret for the TopG vote postback. Votes only credit points when set and matching the vote site's panel. |
| `GTOP100_PINGBACK_KEY` | No | Secret for the Gtop100 vote pingback (as above). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No | Cloudflare Turnstile site key (account-creation CAPTCHA). CAPTCHA is skipped if this and the secret are blank. |
| `TURNSTILE_SECRET_KEY` | No | Cloudflare Turnstile secret key. |
| `RESEND_API_KEY` | No | [Resend](https://resend.com) API key for sending newsletter/announcement and welcome emails. If blank, subscribing still works but no email is sent. |
| `EMAIL_FROM` | No | From address for outgoing email, e.g. `ShinyMS <noreply@shinyms.com>` (must be a Resend-verified domain). |
| `DISCORD_WEBHOOK_URL` | No | Discord incoming webhook; published announcements are mirrored here as an embed. If blank, no Discord message is sent. |

## Production (Docker)

The web app is part of the full stack. From the repo root:

```bash
docker compose up --build
```

The web container runs on port `3000`. Set `NEXTAUTH_URL` to your public domain in `.env`.

## Admin Access

Grant admin access by setting `webadmin = 1` in the `accounts` table:

```sql
UPDATE accounts SET webadmin = 1 WHERE name = 'your-username';
```

Sign in at `/login` — the Admin panel link appears in the header for admin accounts.

## Project Structure

```
web/
├── app/
│   ├── api/          # REST API routes (auth, admin, posts, subscribe, unsubscribe, etc.)
│   ├── admin/        # Admin-only pages (dashboard, users, posts, settings)
│   ├── account/      # Account dashboard — currencies, characters, password change
│   ├── character/    # Dynamic character profile pages
│   ├── characters/   # Character search (by name, server-side)
│   ├── guilds/       # Guild rankings and detail pages
│   ├── news/         # News feed and post detail pages (/news/[id])
│   ├── unsubscribe/  # One-click newsletter unsubscribe page
│   └── ...           # Public pages (home, rankings, bosses, vote, drops, community)
├── components/
│   ├── account/      # ChangePasswordForm client component
│   ├── admin/        # Admin shell + UI primitives
│   ├── layout/       # Header, Footer (renders admin-set social links), Providers
│   ├── posts/        # PostCard (collapsible), HomeAnnouncements (paginated), feeds
│   └── ui/, maple/   # Shared UI + MapleStory-themed widgets
├── lib/              # Prisma client, auth, rate limiter, email (Resend), settings, helpers
├── prisma/
│   ├── schema.prisma # Database schema (maps to existing game DB + CMS tables)
│   └── sql/          # Manual DDL for CMS tables (see "CMS tables" below)
└── public/           # Static assets (logo, maple sprite pack)
```

## Key Features

| Feature | Route | Notes |
|---|---|---|
| Player rankings | `/rankings` | Top 100 by level with job filter |
| Character search | `/characters` | Full-text search by name, links to profile |
| Character profile | `/character/[name]` | Stats, equipment, guild |
| Guild leaderboards | `/guilds` | Ranked by GP, detail at `/guilds/[name]` |
| News & announcements | `/news` | Feed with categories; detail at `/news/[id]`; homepage feed is paginated |
| Boss timer | `/bosses` | Reset countdowns for major bosses |
| Vote | `/vote` | Links to gtop100/TopG, claim vote points |
| Drop search | `/drops` | Look up where items drop |
| Community | `/community` | Megaphone feed, weddings, and fame |
| Newsletter | homepage + `/unsubscribe` | Email signup; one-click unsubscribe |
| Account dashboard | `/account` | Currencies, characters, change password |
| Admin panel | `/admin/dashboard` | Manage users, posts, and social-link settings; view subscriber count |

## CMS Tables

`schema.prisma` is only a **partial view** of the live v83 game database — it maps the
game tables the site reads plus a handful of CMS-only tables. **Never run
`prisma db push`**: it would try to "reconcile" the schema and drop game columns and
indexes it doesn't know about.

Create the CMS-only tables by running the idempotent SQL in `prisma/sql/` against the
database (e.g. `mysql -u root -p v83 < prisma/sql/create_cms_subscribers.sql`):

| File | Table | Purpose |
|---|---|---|
| `create_cms_tables.sql` | `cms_posts`, `cms_downloads` | News/announcements |
| `create_cms_smega.sql` | `cms_smega` | In-game megaphone feed mirror |
| `create_cms_subscribers.sql` | `cms_subscribers` | Newsletter subscribers |
| `create_cms_settings.sql` | `cms_settings` | Admin-editable settings (social links) |

After editing `schema.prisma`, run `npx prisma generate` to refresh the client.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma studio` | Open Prisma Studio to browse data |
