# Auto-post smegas to Discord (and fix the empty community feed)

**Date:** 2026-05-28
**Status:** Design — awaiting user review

## Problem

The `/community` page shows a "Live Megaphone Feed" sourced from the `cms_smega`
table (`web/lib/community.ts` → `recentSmegas`). The Prisma schema and
`web/prisma/sql/create_cms_smega.sql` both claim the game server inserts a row
each time a player fires a world megaphone "(see `UseCashItemHandler`)". **No such
insert exists.** `UseCashItemHandler.java` only broadcasts the in-game packet, so
`cms_smega` is always empty and the feed permanently shows its "The feed is
quiet…" placeholder.

The user wants every smega to **also** auto-post to a Discord channel via webhook.
The capture step and the webhook share the exact same hook point (the megaphone
cases in `UseCashItemHandler`), so both are delivered together.

## Goals

1. Persist every megaphone broadcast to `cms_smega` so the community feed works.
2. Auto-post every megaphone to a configured Discord webhook as a plain-text line.
3. Never let a DB or Discord failure break the in-game megaphone itself.

## Scope

Megaphone types captured + posted (user chose maximum inclusivity — "all
including regular"):

| `UseCashItemHandler` case | In-game item        | `type` value | Notes |
|---------------------------|---------------------|--------------|-------|
| case 1                    | Megaphone (regular) | `mega`       | Channel-only broadcast, but included per user request. |
| case 2                    | Super Megaphone     | `super`      | World-wide. The classic "smega". |
| case 6                    | Item Megaphone      | `item`       | World-wide. Carries an `itemId`. |
| case 7                    | Triple/Multi Mega   | `triple`     | World-wide. Up to 3 lines, joined with " / ". |
| case 5 (megassenger)      | MapleTV messenger   | `tv`         | World-wide text broadcast. **Included by default** (consistent with "all"); flagged as the fuzziest — drop if undesired. |

All `type` values are ≤ 10 chars to fit `cms_smega.type VARCHAR(10)`.

Out of scope: backfilling historical smegas (none were captured); changing the
community page UI; pruning/TTL of `cms_smega` (already documented as a separate
cron concern in the SQL file).

## Architecture (Approach A — all Java-side)

The smega originates in the Java game server, and the game server + Next.js web
app already share the same MySQL database (the web app reads `marriages`,
`famelog`, `characters` directly). So the game server is the single source of
truth: at the one megaphone hook point it writes the DB row and fires the webhook.
No web-side polling, no new network hop, and it keeps working if the website is
down. Java 21 ships `java.net.http.HttpClient`, so no new dependency is needed.

### Components

**1. Config — `config/ServerConfig.java` + `config.yaml`**
- Add `public String DISCORD_SMEGA_WEBHOOK;` to `ServerConfig`.
- Add `DISCORD_SMEGA_WEBHOOK: ""` under the `server:` block in `config.yaml`,
  with a comment. Empty string = webhook disabled (DB capture still runs).
- The webhook URL is a secret: it lives only in the operator's `config.yaml`
  (alongside `DB_PASS`), never committed to the repo and not in the web app's env.

**2. New class — `server/SmegaService.java`**
Single static entry point:
```
static void record(Character player, int channel, String type,
                    String message, Integer itemId)
```
Behavior:
- **DB insert:** `INSERT INTO cms_smega (player, channel, type, message, item_id)
  VALUES (?,?,?,?,?)` via `DatabaseConnection.getConnection()` in
  try-with-resources + `PreparedStatement`. `player` = `player.getName()` (raw
  name, no medal/`" : "` prefix — the table has a separate `player` column).
  `message` = raw megaphone text only.
- **Webhook:** if `DISCORD_SMEGA_WEBHOOK` is non-blank, build the JSON body
  `{"content": "📢 **<player>** (<type> · CH<channel>): \"<message>\""}` and send
  it with `HttpClient.sendAsync` (POST, `Content-Type: application/json`).
  Non-blocking, so the packet-handling thread is never held on network I/O.
  - `content` is hard-capped to Discord's 2000-char limit (truncate with `…`).
  - The player name and message are JSON-escaped; no Discord mentions are
    expanded (`allowed_mentions: {"parse": []}`) so a message like `@everyone`
    in a smega can't ping the channel.
- **Isolation:** the DB insert and the webhook send are each wrapped so any
  exception is logged (SLF4J) and swallowed. `record` must never throw into the
  caller — the in-game megaphone always succeeds regardless.
- A single static `HttpClient` instance is reused across calls.

**3. Hook points — `net/server/channel/handlers/UseCashItemHandler.java`**
In `itemType == 507` block, capture the raw message text into a local before it is
consumed by the broadcast call, then call `SmegaService.record(...)` after the
broadcast in each relevant case:
- case 1: `String text = p.readString();` → broadcast → `record(player, c.getChannel(), "mega", text, null)`.
- case 2: read text + ear into locals (currently both read inline) → broadcast → `record(..., "super", text, null)`.
- case 6: reuse the parsed message and item → `record(..., "item", rawText, item == null ? null : item.getItemId())`.
- case 7: join the `lines` strings with " / " for the stored/posted message → `record(..., "triple", joined, null)`.
- case 5 (megassenger branch only, `megassenger == true`): `record(..., "tv", builder.toString().trim(), null)`.

Note: case 2 currently reads the message and ear byte inline inside the
`broadcastMessage` call. These must be pulled into locals first (packet read
order must be preserved exactly) before broadcasting and recording.

## Data flow

```
player fires megaphone
  → UseCashItemHandler (parse text)
  → broadcastMessage / broadcastPacket  (unchanged in-game behavior)
  → SmegaService.record(...)
       ├─ INSERT cms_smega            → /community feed picks it up on next load
       └─ HttpClient.sendAsync POST   → Discord channel shows the line
```

## Error handling

- DB insert failure: logged, swallowed. Megaphone still broadcasts.
- Webhook not configured (blank URL): DB insert still runs; webhook skipped.
- Webhook HTTP failure / non-2xx / timeout: logged at warn, swallowed. No retry
  (a dropped smega post is not worth a retry queue — YAGNI).
- `record` is invoked after the broadcast, so even an unexpected throw can't stop
  the megaphone the player paid for.

## Testing

- Unit test `SmegaServiceTest`: verify the Discord `content` string is built
  correctly per type (player, type label, channel, message), that mentions are
  neutralized, and that over-long content is truncated to ≤ 2000 chars. The DB
  insert and HTTP send are at the edges; assert `record` swallows a thrown
  `SQLException`/HTTP error without propagating (using the project's existing
  Mockito setup in `testutil`).
- Manual: set `DISCORD_SMEGA_WEBHOOK` to the test webhook, fire each megaphone
  type in-game, confirm (a) the line appears in Discord and (b) a row appears in
  `cms_smega` / the `/community` feed.

## Community page display

`/community` now displays each smega in the same shape as the Discord line. The
`LiveSmegaFeed` component (`web/components/maple/LiveSmegaFeed.tsx`) maps the
`type` code to a label (Super / Item / Triple / Mega / MapleTV) and shows
`<Type> · ch<n> · <time>` in each row's meta, mirroring the Discord
`(<Type> · CH<n>)` format. Once the capture hook is live, rows actually appear
instead of the empty-state placeholder.

## Files touched

- `config/ServerConfig.java` — new field.
- `config.yaml` — new key + comment.
- `server/SmegaService.java` — **new**.
- `net/server/channel/handlers/UseCashItemHandler.java` — hook calls in cases 1/2/5/6/7.
- `src/test/java/server/SmegaServiceTest.java` — **new**.
- `web/components/maple/LiveSmegaFeed.tsx` — type label in feed meta.

## Open question for review

- **MapleTV megassenger (case 5):** included as type `tv` by default. Confirm
  keep, or drop to the four item-based megaphones only.
