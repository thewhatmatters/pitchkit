# Pitchkit: "Ask this kit" brand chat (design plan, not built)
Product Designer, Oct 13, 2026. For Randy's review. **All numbers and names below are EXAMPLE DATA.**

## 1. Where it sits on the 390px kit
- **Entry point:** a single row under the provenance stamp, in the first screen: `Ask about @example_creator ›` with three suggested questions as chips ("Who's the audience?", "Typical reach on Reels?", "Past beauty brands?"). There's no floating bubble, because it covers posts and reads as support chat.
- **Sticky return:** after the first scroll, a slim bottom bar reads "Ask this kit" (44px tall, inside the safe area). It hides while a post is open.
- **Chat view:** a full-height bottom sheet (drag to dismiss) so the kit stays underneath. The input has a placeholder, "Ask about audience, reach, past work". The keyboard pushes the sheet up and the last answer stays visible.
- **The kit stays the source of truth.** Every answer links back to the section of the kit it came from ("See Audience ›"), which scrolls the kit and highlights that block for a moment.

## 2. How answers cite their source
Every number in an answer carries a source tag right after it:
- **Verified:** small navy pill text, "Instagram Insights · last 28 days · updated 2h ago".
- **Creator-reported:** an outlined pill, "Creator-reported", in a different shape and wording. Color never carries the meaning.
- **Unknown:** the bot says "That isn't in this kit." and never estimates.

Example (EXAMPLE DATA):
> **Brand:** What's typical reach on a Reel?
> **Kit:** Median Reel reach is **41,870** over the last 10 Reels `[Verified · Insights · 28d]`. The top Reel reached 112,304 `[Verified]`. The creator lists a **3.1% code-use rate** from a past skincare deal `[Creator-reported]`. See Selected posts ›

Rules:
- Answers come only from the kit's own data store: API fields plus fields the creator labeled as self-reported. There are no web or third-party estimates.
- Rates show their formula on tap (engagement rate = interactions ÷ reach).
- No guessing at demographics outside `follower_demographics`.
- Pricing questions get the creator's pre-written rates answer, quoted word for word. The bot never negotiates.

## 3. Creator-written answers (set up once, in the background)
- In kit settings, the creator writes answers in their own voice for topics like **past brands, rates, availability, content style and exclusivity**. The chat quotes these word for word and tags them `[Creator-reported]`.
- No reply-by-reply approval. The creator sets these answers once, edits them anytime, and can see a log of what brands asked.
- **Verified data is never editable.** Insights numbers have no edit control anywhere. A creator can hide a whole section, but can't change a single number.
- A setup checklist asks the creator to fill in common topics, with a preview of how the chat answers each one. A topic left blank gets "@example_creator hasn't shared that here."

## 4. Trust and risk notes
- If Insights data is older than 7 days, the answers say so and the stamp turns into "updated 9 days ago". The bot doesn't hide stale data.
- It refuses requests for follower identities or private DMs.
- Before the 5-marketer test, check whether brands trust the chat's answers as much as the kit itself.

## 5. Plan and scope
- **Paid plan only.** On a free kit, the Ask row doesn't appear at all, so there's no locked teaser for brands to see.
- **Out of scope for now:** email gates, lead capture and any brand contact path. These come in a later phase.
