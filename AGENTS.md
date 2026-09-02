# Pitchkit

Creator media kits at **pitchkit.app**. Humans start at [README.md](./README.md). Spec: [plan.md](./plan.md). Columns: [data.md](./data.md). Read those before changing product, stack, or schema.

## Product lock

- Instagram is login and sign-up (Professional accounts only). No email. No password.
- Connect screen, **before** Continue with Instagram (not after OAuth):

  > We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.

  Short under the button: *Public posts and Insights only. No DMs. No following list. Disconnect deletes everything we stored.*

  Connect-screen copy version is `disclosure_version` = 1. Meta still shows its own permission list.
  `consent_index` is a **bool**, default **off** — opt-in to anonymized `weekly_counts` only. Not the connect-screen disclosure.
- After login: **Insights**, then **Media kit**. No extra onboarding form.
- Brands open `pitchkit.app/k/[handle]`. They never see Insights.
- Handle is frozen from the Instagram username. Seed demo: `/k/demo`.
- TikTok is optional, from Insights, after they already have an account.
- Kit is a link and a PDF. App works on a phone.
- Look: cream, serif, oxblood (the Atelier mocks). Name on the site is Pitchkit.
- Postgres: see [data.md](./data.md). `users` + `media` from Instagram Login + Insights only. Empty `detections` and `weekly_counts` now.

## Do not

- Add email login, Google, Apple, or TikTok as a second way to create an account.
- Add a post-login wizard, editable handle, computer vision, or a separate analytics product.
- Put image files in the database. Put them in object storage.
- Add Graph columns we do not already get from public posts + Insights, including “for later.”
- Invent product rules that contradict `plan.md`. Change the plan first if the lock is wrong.

## After each turn

If a lock changed, update `plan.md`. If a column or table changed, update `data.md`. Do not leave the new rule only in chat.

## Commands

None yet. App is not scaffolded.
