/** disclosure_version = 1 — show before Continue with Instagram. */
export const DISCLOSURE =
  "We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Disconnect deletes your kit and the copies we stored.";

export const PROFESSIONAL_NOTE =
  "Pitchkit works with Instagram Professional accounts (Business or Creator).";

export const PERSONAL_FAIL =
  "Pitchkit works with Instagram Professional accounts (Business or Creator). In Instagram, switch to Professional, then try again.";

export const PERSIST_FAIL =
  "We could not save your Instagram connection. Try Continue with Instagram again.";

export const OAUTH_STATE_FAIL =
  "That Instagram sign-in expired. Try Continue with Instagram again.";

export const OAUTH_EXCHANGE_FAIL =
  "Instagram did not finish signing you in. Try Continue with Instagram again.";

export const OAUTH_ME_FAIL =
  "We could not read your Instagram profile. Try Continue with Instagram again.";

export const OAUTH_POLL_FAIL =
  "We could not load Instagram Insights. Try Continue with Instagram again.";

export function landingErrorCopy(error: string | undefined): string | null {
  switch (error) {
    case "personal":
      return PERSONAL_FAIL;
    case "persist":
      return PERSIST_FAIL;
    case "oauth_state":
      return OAUTH_STATE_FAIL;
    case "oauth_exchange":
      return OAUTH_EXCHANGE_FAIL;
    case "oauth_me":
      return OAUTH_ME_FAIL;
    case "oauth_poll":
      return OAUTH_POLL_FAIL;
    default:
      return null;
  }
}

export const SUPPORT_EMAIL = "randy@whatmatters.so";

export const EMPTY_GRID = "Pulling your grid…";

export const DISCONNECT_TITLE = "Disconnect Instagram?";
export const DISCONNECT_CONFIRM =
  "Disconnect deletes your kit and the copies we stored.";
export const DISCONNECT_KEEP = "Keep connected";

/** Account settings Delete confirm — RE memo, Pattern — account settings (owner). */
export const DELETE_ACCOUNT_TITLE = "Delete your Pitchkit account?";
export const DELETE_ACCOUNT_CONFIRM =
  "This permanently deletes your kit, stored media copies, and connection. Your Instagram account is not deleted. This cannot be undone.";
export const DELETE_ACCOUNT_CANCEL = "Cancel";
export const DELETE_ACCOUNT_ACTION = "Delete account";

export const ACCOUNT_MENU_LABEL = "My account";
export const ACCOUNT_SETTINGS_ACTION = "Account settings";
export const DISCONNECT_INSTAGRAM_ACTION = "Disconnect Instagram";
export const RECONNECT_INSTAGRAM_ACTION = "Reconnect Instagram";

export const PITCHKIT_OWNER_TITLE = "Your Pitchkit";
export const PITCHKIT_OWNER_SUPPORTING = "Edit what brands see on your public kit.";

/** Quiet demo honesty — under Continue, not in the hero. */
export const DEMO_SESSION_NOTE = "Opens the demo Insights session.";

/** Quiet Insights cue — cookie-gated page. Do not shout at brands. */
export const INSIGHTS_PRIVATE = "Private to you";

/** Insights toasts — WMDS Toast Pattern requires title + description. */
export const TOAST_KIT_COPIED_TITLE = "Kit link copied";
export const TOAST_KIT_COPIED_DESCRIPTION = "The public kit URL is ready to paste.";
export const TOAST_KIT_COPY_FAILED_TITLE = "Could not copy the kit link";
export const TOAST_KIT_COPY_FAILED_DESCRIPTION =
  "Copy the URL from the page, or try Share kit again.";
export const TOAST_POST_HIDDEN_TITLE = "Post hidden from kit";
export const TOAST_POST_HIDDEN_DESCRIPTION = "It no longer appears in the shareable Pitchkit.";
export const TOAST_POST_RESTORED_TITLE = "Post restored to kit";
export const TOAST_POST_RESTORED_DESCRIPTION = "It appears in the shareable Pitchkit again.";
export const TOAST_HIDE_FAILED_TITLE = "Could not hide this post";
export const TOAST_RESTORE_FAILED_TITLE = "Could not restore this post";
export const TOAST_KIT_PROFILE_FAILED_TITLE = "Could not save kit profile";
export const TOAST_KIT_PROFILE_FAILED_DESCRIPTION =
  "Intro, past brands, or theme could not be stored. Try again.";
export const TOAST_THEME_SAVED_TITLE = "Theme saved";
export function toastThemeSavedDescription(theme: string): string {
  return `Public kit appearance is ${theme}.`;
}

/**
 * Owner empty states (Product Designer spec, 2026-10-14). Each says why it is
 * empty and what happens next. Brands never see these: `/k/<handle>` hides the
 * section instead. Pitchkit has no background sync — data pulls when the
 * creator opens Insights or Settings (last pull older than 6 hours) or taps
 * Refresh — so never promise a daily check.
 */
export const REACH_EMPTY_BADGE = "Building";
export const REACH_EMPTY_TITLE = "Reach fills in as you post";
export const REACH_EMPTY_BODY =
  "Each post you share adds to this chart. A few posts over a week or two is enough for a clear line.";
export const REACH_EMPTY_NEXT = "Brands don’t see this card until there’s something to show.";

/** Chart.Cartesian hatch label for in-series gaps (`examples-pitchkit--insufficient-*-data`). */
export const REACH_NO_DATA_LABEL = "No data";

export const AUDIENCE_EMPTY_BADGE = "Updates when you open Pitchkit";
export const AUDIENCE_EMPTY_TITLE = "No audience data yet";
export const AUDIENCE_EMPTY_BODY =
  "Instagram hasn’t shared who follows you yet. That’s normal for new or newly switched Professional accounts.";
export const AUDIENCE_EMPTY_NEXT =
  "We check again each time you open Insights or Settings, or tap Refresh.";

/** Instagram withholds follower demographics under 100 followers. */
export const AUDIENCE_MIN_FOLLOWERS = 100;
export const AUDIENCE_UNDER_MIN_BADGE = "Unlocks at 100 followers";
export function audienceUnderMinTitle(followers: number): string {
  const toGo = Math.max(1, AUDIENCE_MIN_FOLLOWERS - Math.max(0, Math.floor(followers)));
  return toGo === 1 ? "1 follower to go" : `${toGo} followers to go`;
}
export function audienceUnderMinProgress(followers: number): string {
  return `${Math.max(0, Math.floor(followers))} of ${AUDIENCE_MIN_FOLLOWERS} followers`;
}
export const AUDIENCE_UNDER_MIN_BODY =
  "Instagram shares follower age, gender and location once an account reaches 100 followers.";
export const AUDIENCE_UNDER_MIN_NEXT =
  "It appears here on its own. Until then, brands see your posts, reach and engagement.";

/** Few posts (fewer than 4 on the kit). */
export const FEW_POSTS_TARGET = 4;
export function fewPostsBadge(count: number): string {
  return count === 1 ? "1 post" : `${count} posts`;
}
export function fewPostsProgress(count: number): string {
  return `${count} of ${FEW_POSTS_TARGET} posts so far.`;
}
export const POSTS_SYNC_NOTE = "New Instagram posts show up the next time your numbers refresh.";
export const FEW_POSTS_BRANDS_NOTE = "Brands only see your real posts.";

/** No past brands (owner). Public kit hides the section. */
export const PAST_BRANDS_EMPTY_BADGE = "Optional";
export const PAST_BRANDS_EMPTY_TITLE = "No past brands yet";
export const PAST_BRANDS_EMPTY_BODY =
  "Worked with a brand, even for free product? Add it here. Brands like seeing who’s trusted you.";
export const PAST_BRANDS_EMPTY_NEXT =
  "Just starting out? Leave this empty. It stays hidden on your public kit until you add one.";
export const PAST_BRANDS_EMPTY_ACTION = "Add a brand";

/** Posts section on the kit (public and owner preview). */
export const POSTS_SECTION_TITLE = "Recent posts";
export const POSTS_SECTION_SUPPORTING = "Straight from Instagram.";
