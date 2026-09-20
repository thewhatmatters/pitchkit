# Hide / restore proof

Hide from kit removes a selected post from the shareable PitchKit. Owner Insights Recent proof stays read-only (no Manage kebab). Hide/restore lives on the PitchKit tab. Persistence is KV `HIDDEN_KIT` (WHA-311/312): reload and a brand `/k/demo` must agree.

## Sub-features

- `hide-menu` opens MoreMenu on a selected PitchKit post and starts Hide from kit.
- `hide-confirm` confirms the AlertDialog **Hide from kit**.
- `hide-toast-undo` shows toast **Post hidden from kit** with description **It no longer appears in the shareable PitchKit.** and **Undo**.
- `hide-reload` after reload still excludes the post from the shareable set and offers Restore on the PitchKit tab (not client-only).
- `hide-anon-kit` drops the post on `--fresh` `/k/demo`.
- `restore-kit` puts the post back (Undo or **Restore to kit**) with toast **Post restored to kit** / **It appears in the shareable PitchKit again.** and the anon kit shows it again.

## How to get to it (user POV)

- On Insights, switch to **PitchKit** → selected post MoreMenu (**Manage selected post N**) → **Hide from kit** → confirm.
- After hide: toast **Post hidden from kit** (description + **Undo**), or **Hidden from kit** → **Restore to kit** (toast **Post restored to kit**).
- Brand path: open `/k/demo` signed out.

## Driving it with control-pitchkit

Preconditions:

- Live https://pitchkit.app (local `next dev` has no KV — skip this feature there).
- `connect` + `doctor --require-session`.
- Prefer restoring already-hidden posts before hiding another. If **N shown** is already `< 6`, Restore first rather than hiding more.
- This recipe **must** Restore before it ends. Cleanup `--restore-hidden` is backup, not the proof.

- **Inventory first.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /insights`. Switch to **PitchKit**. Note selected posts and whether any row is **Hidden**. If Hidden rows exist, choose **Manage hidden post** then **Restore to kit** until none remain (or run `restore-seed` and reload).
- **Open hide.** On the first selected card, choose MoreMenu. Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --name "Manage selected post 1"`. Menu includes **Hide from kit**.
- **Confirm.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --role menuitem --name "Hide from kit"`. Dialog title is **Hide this post from PitchKit?**. Confirm with `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --role button --name "Hide from kit"`.
- **Toast.** A toast **Post hidden from kit** with description **It no longer appears in the shareable PitchKit.** offers **Undo**. Do **not** click Undo yet if proving reload (WHA-311/312). Capture `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs screenshot --path artifacts/hide-restore-proof/hidden-toast.png`.
- **Reload partition.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /insights` and open **PitchKit**. A **Hidden** row remains with **Manage hidden post** / **Restore to kit**. Selected posts do not include that post.
- **Anon kit.** Run `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs goto /k/demo --fresh` then `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs screenshot --path artifacts/hide-restore-proof/anon-hidden.png --fresh` and `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs snapshot --aria --path artifacts/hide-restore-proof/anon-hidden.aria.txt --fresh`. Public grid has six-or-fewer posts and is missing the hidden one. No Insights chrome.
- **Restore.** Back on owner PitchKit: `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --name "Manage hidden post"` then `node .cursor/skills/verify-pitchkit/helpers/control-pitchkit.mjs click --name "Restore to kit"`. Toast **Post restored to kit** / **It appears in the shareable PitchKit again.** Alternate: toast **Undo** on the same hide, before reload.
- **Anon kit restored.** Repeat `--fresh` `/k/demo`. The post is back. Capture `artifacts/hide-restore-proof/anon-restored.png` and `anon-restored.aria.txt`.

## Gotchas

- Live demo is shared. A hide you do not Restore is a production kit defect for the next visitor. Always Undo/Restore in this recipe; run `cleanup --restore-hidden` if anything looks stuck.
- Prefer Restore of existing Hidden rows over hiding a second post.
- Menu item and dialog confirm share the name **Hide from kit**. Use `--role menuitem` then `--role button`. **Keep post** cancels.
- Toast Undo is easy to miss (`duration` ~6s). Reload + Restore is the persistence proof; Undo is the owner convenience path.
- Owner cookie `pitchkit_hidden` is a mirror. Brands have no cookie — if anon `/k/demo` still shows the post after hide, KV SoT failed (WHA-312 cold Map / persist).
- `restore-seed` POSTs the six seed IDs. That is cleanup, not the user path. Do not cite it as hide-restore proof.
- Insights Recent proof is read-only. Do not look for **Manage ranked post** there.
- Do not run this feature in parallel with another agent.
