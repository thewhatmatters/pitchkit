/** disclosure_version = 1 — show before Continue with Instagram. */
export const DISCLOSURE =
  "We only use your public posts and Instagram Insights to build your media kit. We don’t read DMs, who you follow, or unfollowers. Deleting your account erases your kit and the copies we\u00a0stored.";

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


/** Account settings Delete confirm — RE memo, Pattern — account settings (owner). */
export const DELETE_ACCOUNT_TITLE = "Delete your Pitchkit account?";
export const DELETE_ACCOUNT_CONFIRM =
  "Your kit link stops working right away, so anyone you've sent it to will see it's gone. We erase your account and all the Instagram data we stored. Your Instagram account itself isn't touched. This can't be\u00a0undone.";
/** Field label is "Type @handle to confirm" with the handle in bold. */
export const DELETE_ACCOUNT_TYPE_PREFIX = "Type ";
export const DELETE_ACCOUNT_TYPE_SUFFIX = " to confirm";
export const DELETE_ACCOUNT_CANCEL = "Cancel";
export const DELETE_ACCOUNT_ACTION = "Delete account";
export const DELETE_ACCOUNT_TRIGGER = "Delete account…";
/** Trimmed, optional leading @, case-insensitive. */
export function deleteConfirmMatches(typed: string, handle: string): boolean {
  const norm = (v: string) => v.trim().replace(/^@/, "").toLowerCase();
  return norm(handle) !== "" && norm(typed) === norm(handle);
}

export const DANGER_ZONE_CAPTION = "Danger zone";
export const DANGER_ZONE_LINE = "Permanently delete your Pitchkit account and\u00a0kit.";
export const ACCOUNT_DELETED_TOAST = "Your account was deleted.";
export const SIGN_OUT_ACTION = "Sign out";

export const ACCOUNT_MENU_LABEL = "My account";
export const ACCOUNT_SETTINGS_ACTION = "Account settings";
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
export const TOAST_POST_HIDDEN_DESCRIPTION = "It no longer appears in the shareable PitchKit.";
export const TOAST_POST_RESTORED_TITLE = "Post restored to kit";
export const TOAST_POST_RESTORED_DESCRIPTION = "It appears in the shareable PitchKit again.";
export const TOAST_HIDE_FAILED_TITLE = "Could not hide this post";
export const TOAST_RESTORE_FAILED_TITLE = "Could not restore this post";
export const TOAST_KIT_PROFILE_FAILED_TITLE = "Could not save kit profile";
export const TOAST_KIT_PROFILE_FAILED_DESCRIPTION =
  "Intro, past brands, or theme could not be stored. Try again.";
export const TOAST_THEME_SAVED_TITLE = "Theme saved";
export function toastThemeSavedDescription(theme: string): string {
  return `Public kit appearance is ${theme}.`;
}

/** State — insufficient reach data (`examples-pitchkit--insufficient-reach-data`). */
export const REACH_INSUFFICIENT_TITLE = "No reach data yet";
export const REACH_INSUFFICIENT_BODY =
  "Connect more Instagram activity to plot the last 30 days.";

/** Chart.Cartesian hatch + insufficient empty-well Badge (`examples-pitchkit--insufficient-*-data`). */
export const REACH_NO_DATA_LABEL = "No data";

/** State — insufficient audience data (`examples-pitchkit--insufficient-audience-data`). */
export const AUDIENCE_INSUFFICIENT_TITLE = "No audience data yet";
export const AUDIENCE_INSUFFICIENT_BODY =
  "Connect Instagram Insights demographics when available.";

