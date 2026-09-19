"use client";

import { Copy } from "lucide-react";
import { CreatorIdentityStrip } from "@/components/creator-identity-strip";
import { DisconnectControl } from "@/components/disconnect-control";
import {
  PATTERN_BRAND_CLASS,
  PATTERN_CONNECTION_META_CLASS,
  PATTERN_CONTENT_BAND_CLASS,
  PATTERN_CONTENT_CLASS,
  PATTERN_HEADER_COPY_CLASS,
  PATTERN_HEADER_SECTION_CLASS,
  PATTERN_PAGE_CLASS,
  PATTERN_SECTION_EYEBROW_CLASS,
  PATTERN_SETTINGS_BODY_CLASS,
  PATTERN_SETTINGS_CARD_CLASS,
  PATTERN_SHARE_KIT_ACTIONS_CLASS,
  PATTERN_SHARE_KIT_STACK_CLASS,
  PATTERN_SUPPORTING_CLASS,
  PATTERN_TOPBAR_BAND_CLASS,
  PATTERN_TOPBAR_CLASS,
  PATTERN_TOPBAR_END_CLASS,
} from "@/components/pattern-tokens";
import {
  Avatar,
  Badge,
  Button,
  Card,
  PageHeader,
  TextLink,
  cardTitleClasses,
  toast,
} from "@/components/wmds";
import { SupportFooter } from "@/components/support-footer";
import {
  TOAST_KIT_COPIED_DESCRIPTION,
  TOAST_KIT_COPIED_TITLE,
  TOAST_KIT_COPY_FAILED_DESCRIPTION,
  TOAST_KIT_COPY_FAILED_TITLE,
} from "@/lib/copy";
import { creatorIdentityFromUser } from "@/lib/creator-identity";
import { inventoryLastUpdated } from "@/lib/inventory";
import { kitPath } from "@/lib/kit";
import type { Media, User } from "@/lib/schema";

type AccountSettingsProps = {
  user: User;
  posts: Media[];
};

/**
 * Pattern — creator identity (owner settings)
 * (`examples-pitchkit--creator-identity-owner-settings`).
 * Reconnect / sign out / disconnect stay account-only below the card.
 */
export function AccountSettings({ user, posts }: AccountSettingsProps) {
  const identity = creatorIdentityFromUser(user, {
    lastSyncedAt: inventoryLastUpdated(posts),
  });
  const sharePath = kitPath(identity.handle);
  const avatarName = identity.displayName ?? identity.handle;

  async function copyShareKitUrl() {
    const url = `${window.location.origin}${sharePath}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.add({
        title: TOAST_KIT_COPIED_TITLE,
        description: TOAST_KIT_COPIED_DESCRIPTION,
      });
    } catch {
      toast.add({
        title: TOAST_KIT_COPY_FAILED_TITLE,
        description: TOAST_KIT_COPY_FAILED_DESCRIPTION,
      });
    }
  }

  return (
    <main className={PATTERN_PAGE_CLASS}>
      <div className={PATTERN_TOPBAR_BAND_CLASS}>
        <header className={PATTERN_TOPBAR_CLASS}>
          <span className={PATTERN_BRAND_CLASS}>PitchKit</span>
          <span />
          <span className={PATTERN_TOPBAR_END_CLASS}>
            <Avatar name={avatarName} src={identity.profilePictureUrl} size="sm" />
          </span>
        </header>
      </div>

      <div className={PATTERN_CONTENT_BAND_CLASS}>
        <div className={PATTERN_CONTENT_CLASS}>
          <section className={PATTERN_HEADER_SECTION_CLASS}>
            <PageHeader variant="page" title="Settings" />
            <div className={PATTERN_HEADER_COPY_CLASS}>
              <p className={PATTERN_SUPPORTING_CLASS}>
                Instagram connection for this PitchKit.
              </p>
            </div>
          </section>

          <Card
            variant="outlined"
            shape="rounded"
            bodyTerminal
            className={PATTERN_SETTINGS_CARD_CLASS}
          >
            <Card.Header
              start={<h2 className={cardTitleClasses}>Connected Instagram</h2>}
              end={
                identity.connected ? (
                  <Badge variant="success" emphasis="muted" size="sm">
                    Connected
                  </Badge>
                ) : null
              }
            />
            <Card.Body>
              <div className={PATTERN_SETTINGS_BODY_CLASS}>
                <CreatorIdentityStrip
                  identity={identity}
                  nameAs="p"
                  showProfessionalChip
                />
                <div className={PATTERN_SHARE_KIT_STACK_CLASS}>
                  <span className={PATTERN_SECTION_EYEBROW_CLASS}>Share kit</span>
                  <div className={PATTERN_SHARE_KIT_ACTIONS_CLASS}>
                    <TextLink href={sharePath}>{sharePath}</TextLink>
                    <Button
                      role="secondary"
                      size="sm"
                      icon={<Copy />}
                      onClick={() => void copyShareKitUrl()}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                {identity.lastSyncedLabel != null ? (
                  <p className={PATTERN_CONNECTION_META_CLASS}>
                    Last synced {identity.lastSyncedLabel}
                  </p>
                ) : null}
              </div>
            </Card.Body>
          </Card>

          <div className="col-span-full flex flex-wrap gap-2">
            <form action="/auth/instagram" method="post">
              <Button type="submit" role="secondary">
                Reconnect Instagram
              </Button>
            </form>
            <form action="/auth/sign-out" method="post">
              <Button type="submit" role="secondary">
                Sign out
              </Button>
            </form>
            <DisconnectControl />
          </div>

          <SupportFooter>
            <p>
              <a href="/insights">Insights</a>
            </p>
          </SupportFooter>
        </div>
      </div>
    </main>
  );
}
