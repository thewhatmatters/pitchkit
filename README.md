# Pitchkit

A hosted **media kit** for Instagram creators. They sign in with Instagram, see their numbers, and send brands a link. Live site: **pitchkit.app**. Public kit: `https://pitchkit.app/k/[handle]`.

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [AGENTS](./AGENTS.md)

GitHub: [thewhatmatters/pitchkit](https://github.com/thewhatmatters/pitchkit).

---

## How it works

1. Creator opens pitchkit.app and reads the collection note.
2. They tap **Continue with Instagram** (Professional accounts only — Business or Creator). That is login and sign-up. No email, no password.
3. We pull public posts and Insights (not DMs, not who they follow).
4. They land on **Insights** (private). **Media kit** is the shareable page.
5. Brands open `https://pitchkit.app/k/[handle]`. They do not sign in.

Handle is taken from the Instagram username at signup and **does not change**. Local/demo kit: `/k/demo`.

If they rename on Instagram, this URL stays put. TikTok, PDF, and extra profile fields are written in the plan as later — not v1.

On the connect screen, before they tap Instagram:

> We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

---

## Where things live

| File | What it is |
|---|---|
| [PLAN.md](./PLAN.md) | Product and build brief |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | How the pieces connect (Workers, Graph, Neon, R2) |
| [DATA.md](./DATA.md) | Database tables and column names |
| [AGENTS.md](./AGENTS.md) | Short lock list for coding agents |
| `app/` | Next.js App Router routes |
| `components/` | Kit, inventory, posts, owner chrome (WMDS composition) |
| `db/` | Postgres schema from [DATA.md](./DATA.md) (`users`, `media`, empty `detections` + `weekly_counts`) |
| `lib/` | Schema types, in-repo seed, kit math (six-post rank + ER), example Insights inventory |
| `public/demo/` | Placeholder kit images (`r2_key` maps here until R2) |

Until Hyperdrive exists, `/k/demo` and `/insights` read the in-repo seed (`lib/seed.ts`). Same `User` / `Media` types as live. `TOKEN_KEY` is not required for seed. Unknown handle (`/k/nope`) is 404. No Neon or Instagram token yet.

Stub login: **Continue with Instagram** POST/GET `/auth/instagram` sets an httpOnly Pitchkit session for handle `demo` and redirects to `/insights`. `/insights` without that cookie redirects `/`. Sign out clears the cookie. `/k/demo` stays public (no cookie).

`/insights` (after the stub cookie) is a stacked **example inventory** of every locked kit object so Design can see what to design. Numbers are marked **Example data — not live**. Not a layout lock. `/k/demo` is still the public kit card.

---

## Data, in one sentence

Postgres holds creator rows and the posts we fetched. Photos go in file storage, not in SQL. We only store what Instagram Login and Insights already give us. Full column list: [DATA.md](./DATA.md).

Disconnect deletes the creator, their posts, and their files. Anonymous weekly totals stay only if they cannot identify anyone.

---

## Stack (locked)

| Piece | Choice |
|---|---|
| App | Next.js App Router, TypeScript, Tailwind v4 |
| UI | WMDS (`@whatmatters/wmds`). No shadcn. Storybook stays in the WMDS repo. |
| Compute | Cloudflare Workers, official OpenNext (`@opennextjs/cloudflare`) |
| DB | Neon Postgres + Hyperdrive |
| Files | R2 `pitchkit-media` |
| Auth | Instagram Login + httpOnly cookie |
| Charts | Nivo via WMDS Chart (not CSS, not in this app yet) |

Install WMDS from `github:thewhatmatters/wmds` (CI cannot use `../wmds`). `prepare` builds `dist/`. Local `npm install ../wmds` still works. `postinstall` copies Geist font files into the WMDS `dist/files` path that `styles.css` expects. Details: [PLAN.md](./PLAN.md#stack-locked), [ARCHITECTURE.md](./ARCHITECTURE.md), WMDS [`CONSUMING.md`](https://github.com/thewhatmatters/wmds/blob/main/CONSUMING.md).

Cloudflare and Support (for now): randy@whatmatters.so. Neon region is chosen when we create the database.

Env **names** only (see `.env.example`): `IG_APP_ID`, `IG_APP_SECRET`, `TOKEN_KEY`, plus Hyperdrive notes. Never commit values.

---

## Run it

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Routes: `/`, `/?error=personal`, `/auth/instagram` (stub connect), `/auth/sign-out`, `/insights`, `/insights?tab=kit`, `/insights?grid=pulling`, `/k/demo`, `/k/nope` (404), `/privacy`, `/delete`.

```bash
npm test
```

Tests cover six-post rank (saves → reach → likes), ER when Insights are missing, the example Insights inventory (not live), and set/clear of the Pitchkit session cookie plus the Insights gate.

Production-shaped local Workers runtime (official OpenNext):

```bash
npm run preview
```

Build only:

```bash
npm run build
```

Deploy to Workers (needs Cloudflare auth and bindings):

```bash
npm run deploy
```
