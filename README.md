# Pitchkit

A hosted **media kit** for Instagram creators. They sign in with Instagram, see their numbers, and send brands a link. Live site: **pitchkit.app**. Public kit: `https://pitchkit.app/k/[handle]`.

The app is not built yet. This repo is the spec and the starting point. GitHub: [thewhatmatters/pitchkit](https://github.com/thewhatmatters/pitchkit).

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
| [plan.md](./plan.md) | Product and build brief |
| [architecture.md](./architecture.md) | How the pieces connect (Workers, Graph, Neon, R2) |
| [data.md](./data.md) | Database tables and column names |
| [AGENTS.md](./AGENTS.md) | Short lock list for coding agents |

No application source yet. When the app exists, this table will point at the folders.

---

## Data, in one sentence

Postgres holds creator rows and the posts we fetched. Photos go in file storage, not in SQL. We only store what Instagram Login and Insights already give us. Full column list: [data.md](./data.md).

Disconnect deletes the creator, their posts, and their files. Anonymous weekly totals stay only if they cannot identify anyone.

---

## Stack (planned)

- App: Next.js on Cloudflare
- Database: Neon Postgres
- Files: Cloudflare R2
- Domain: pitchkit.app

Look: cream, serif, oxblood. The name on the site is Pitchkit (mocks may say Atelier).

Cloudflare and Support (for now): randy@whatmatters.so. Neon region is chosen when we create the database.

---

## Run it

Nothing to run until the app is scaffolded. After that, commands go here.

---

## If you are changing the product

1. Read [plan.md](./plan.md).
2. If columns change, update [data.md](./data.md) in the same change.
3. Keep [AGENTS.md](./AGENTS.md) in line with those two.
