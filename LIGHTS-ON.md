# Pitchkit lights-on

Design + User Research. 2026-09-02. Not a layout lock. Randy: if we charge, name the paid features and an entry price.

Randy: Pitchkit stays free. `/k/` including Insights stays free. Share-link paywall is out. Bench SoT with `SWOT.md`, `GLOSSARY.md`, `PLAN.md`, `AGENTS.md`. Interviews unrun.

Security: do not sell the list or rates. Ads never on kit fields. No pixel that can see contact or rate on `/k/[handle]`. Checkout secrets stay out of rooms.

## Free promise

`/k/[handle]` stays free, including Insights objects when connected (typical reach, saves, 30-day chart, geo / age / gender, bio). Hide when missing. Dash, not zeros. Daily Insights on the live page stay free (Beacons already gives a daily kit at $0 — charging for sync would look worse).

**Both URLs (Randy, P+E 2026-09-02):** `pitchkit.app/k/[handle]` stays the free share URL. `their.domain` `/` is the **same** public kit. No redirect either way. Insights stays on pitchkit.app (cookie never on their host). Custom domain does not paywall `/k/`.

**Do not paywall:** the `/k/` link, reach, saves, chart, geo, age, gender, bio.

**Breaks the promise**

- Paywall the share link (Later: share kit = current paid Social).
- Gate reach / saves / demographics / chart behind a paid plan.
- Watermark so hard a brand bounces.
- Sell contacts.
- Ads or pixels on contact or rate slots.

## Paid SKU (around the kit, not the kit)

One SKU. Not three products.

1. PDF export
2. Custom domain on the same kit. **Both URLs:** `their.domain` `/` serves the same public kit as `pitchkit.app/k/[handle]`. No redirect either way. Insights stays on pitchkit.app (cookie never on their host). Not a second product and not a paywall of `/k/`. Not built this round. Cloudflare for SaaS later. Apex later. Subdomain CNAME first when we paint it. Diagram: [ARCHITECTURE.md](./ARCHITECTURE.md) / [WHA-302](https://linear.app/whatmatters/issue/WHA-302) — do not duplicate Backend’s diagram here.
3. Strip the Pitchkit badge

**Entry price: $9/mo or $90/yr.**

- Under Later Starter **$18.75/mo** yearly ([later.com/pricing-v3](https://later.com/pricing-v3)) — and they charge that *to share*.
- At Beacons Creator **$10/mo** ([beacons.ai/i/pricing](https://beacons.ai/i/pricing)) without copying their ~9% store fee.
- Above CollabKit Pro **$5** ([collabkit.me/pricing](https://collabkit.me/pricing)) — screenshot demo + PDF.
- Below mediakit.bio Creator **$15** ([mediakit.bio/pricing](https://mediakit.bio/pricing)).

We are selling PDF + domain + a clean badge on a real Insights kit, not a scheduler.

**Do not enter at $19–25.** That is Later’s tax for Calendar. **Do not enter at $0 paid-tier with a take-rate** unless we run checkout (not v1).

## Not paid in v1

Extra platforms. Marketplace. Rates. Ads on the kit. Selling the list.

## What kits charge (public, 2026-09-02)

No invented dollars. `?` = unpublished on a primary page.

| Product | Public $ | How the kit is gated |
| --- | --- | --- |
| Later | Official Starter **$18.75/mo** billed yearly ([later.com/pricing-v3](https://later.com/pricing-v3)). Help: [Create Your Media Kit](https://help.later.com/hc/en-us/articles/8739747472791-Create-Your-Media-Kit) — share kit = current paid plans. | Paid-to-share. Do not copy. |
| Beacons | Free **includes daily-updating kit**. Creator **$10/mo**. Lights-on: ~9% seller fee on the store + paid domain ([beacons.ai/i/pricing](https://beacons.ai/i/pricing)). | Kit free; suite pays. |
| InfluenceFlow | Kit **$0**. Take processing (~3.9% card / 1.8% ACH) if money moves there. Insights depth `?`. | Kit free; take-rate later. Not v1 for us. |
| mediakit.bio | **$0** / **$15** (PDF + daily) ([mediakit.bio/pricing](https://mediakit.bio/pricing)). | Freemium *around* the kit. |
| CollabKit | **$0** / **$5** (PDF) ([collabkit.me/pricing](https://collabkit.me/pricing)). | Same pattern. |
| OwlScran | Free. Paid `$` unpublished (`?`). | Honesty analog, not a price analog. |

See `SWOT.md` for the full landscape.

## Rec

Keep `/k/` fully free, including Insights. If we charge: one SKU (PDF + custom domain + strip badge) at **$9/mo or $90/yr**. Ads only off-kit if we need them sooner. Do not copy Later’s paid-to-share.

## Related

- `SWOT.md` — jobs, S/W/O/T, public kit contract.
- Linear [WHA-301](https://linear.app/whatmatters/issue/WHA-301/pitchkit-stays-free-lights-on-without-paywalling-k).
