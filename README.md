# Pitchkit

A hosted **media kit** for Instagram creators. They sign in with Instagram, see their numbers, and send brands a link. Live site: **pitchkit.app**. Public kit: `https://pitchkit.app/k/[handle]`.

**Docs:** [README](./README.md) · [plan](./PLAN.md) · [architecture](./ARCHITECTURE.md) · [data](./DATA.md) · [AGENTS](./AGENTS.md)

The app is not built yet. This repo is the spec and the starting point. GitHub: [thewhatmatters/pitchkit](https://github.com/thewhatmatters/pitchkit).

---

## How it works

1. Creator opens pitchkit.app and reads the collection note.
2. They tap **Continue with Instagram** (Professional accounts only — Business or Creator). That is login and sign-up. No email, no password.
3. We pull public posts and Insights (not DMs, not who they follow).
4. They land on **Insights** (private). **Media kit** is the shareable page.
5. Brands open `https://pitchkit.app/k/[handle]`. They do not sign in.

Handle is taken from the Instagram username at signup and **does not change**. Local/demo kit: `/k/demo`. The kit leads with name and handle; engagement rate is the hire number, followers are scale, and reach/saves/chart appear only when Insights exist (never as zeros).

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

No application source yet. When the app exists, this table will point at the folders.

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
| Compute | Cloudflare Workers, official OpenNext |
| DB | Neon Postgres + Hyperdrive |
| Files | R2 `pitchkit-media` |
| Auth | Instagram Login + httpOnly cookie |
| Charts | CSS |

Install WMDS from `../wmds` or GitHub until it is published; run `npm run build` there so `dist/` exists. Details: [PLAN.md](./PLAN.md#stack-locked), [ARCHITECTURE.md](./ARCHITECTURE.md).

Cloudflare and Support (for now): randy@whatmatters.so. Neon region is chosen when we create the database.

---

## Run it

Nothing to run until the app is scaffolded. After that, commands go here.

---

## If you are changing the product

1. Read [PLAN.md](./PLAN.md).
2. If the picture of the stack changes, update [ARCHITECTURE.md](./ARCHITECTURE.md).
3. If columns change, update [DATA.md](./DATA.md) in the same change.
4. Keep [AGENTS.md](./AGENTS.md) in line with those.
