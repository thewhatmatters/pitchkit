"use client";

import { useRef, useState } from "react";
import { Copy } from "lucide-react";
import { CreatorIdentityStrip } from "@/components/creator-identity-strip";
import { DisconnectControl } from "@/components/disconnect-control";
import {
  PATTERN_BRAND_CLASS,
  PATTERN_CONNECTION_META_CLASS,
  PATTERN_PAGE_CLASS,
  PATTERN_SECTION_EYEBROW_CLASS,
  PATTERN_SETTINGS_BODY_CLASS,
  PATTERN_SETTINGS_CARD_CLASS,
  PATTERN_SHARE_KIT_ACTIONS_CLASS,
  PATTERN_SHARE_KIT_STACK_CLASS,
  PATTERN_TOPBAR_BAND_CLASS,
  PATTERN_TOPBAR_CLASS,
  PATTERN_TOPBAR_END_CLASS,
  PATTERN_USER_SETTINGS_ACTIONS_CLASS,
  PATTERN_USER_SETTINGS_BODY_CLASS,
} from "@/components/pattern-tokens";
import {
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  TextLink,
  cardTitleClasses,
  toast,
} from "@/components/wmds";
import {
  DELETE_ACCOUNT_ACTION,
  DELETE_ACCOUNT_CANCEL,
  DELETE_ACCOUNT_CONFIRM,
  DELETE_ACCOUNT_TITLE,
  TOAST_KIT_COPIED_DESCRIPTION,
  TOAST_KIT_COPIED_TITLE,
  TOAST_KIT_COPY_FAILED_DESCRIPTION,
  TOAST_KIT_COPY_FAILED_TITLE,
} from "@/lib/copy";
import { creatorIdentityFromUser, type CreatorIdentity } from "@/lib/creator-identity";
import { inventoryLastUpdated } from "@/lib/inventory";
import { kitPath } from "@/lib/kit";
import type { Media, User } from "@/lib/schema";

type AccountSettingsProps = {
  user: User;
  posts: Media[];
};

type AccountSettingsDialogProps = AccountSettingsProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type AccountSettingsAvatarButtonProps = {
  identity: CreatorIdentity;
  open: boolean;
  onClick: () => void;
};

/**
 * Pattern — account settings (owner)
 * (`examples-pitchkit--account-settings-owner`).
 * Topbar Avatar opens Dialog: Connected Instagram → Share kit → Sign out →
 * Disconnect → Delete account last. Delete confirm is the RE memo copy.
 * Dialog owns Delete — footer / `/delete` is not the primary path.
 */

export function AccountSettingsAvatarButton({
  identity,
  open,
  onClick,
}: AccountSettingsAvatarButtonProps) {
  const avatarName = identity.displayName ?? identity.handle;

  return (
    <Button
      type="button"
      role="ghost"
      size="sm"
      aria-label="Account settings"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={onClick}
    >
      <Avatar name={avatarName} src={identity.profilePictureUrl} size="sm" />
    </Button>
  );
}

export function AccountSettingsDialog({
  user,
  posts,
  open,
  onOpenChange,
}: AccountSettingsDialogProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const identity = creatorIdentityFromUser(user, {
    lastSyncedAt: inventoryLastUpdated(posts),
  });
  const sharePath = kitPath(identity.handle);

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <Dialog.Content size="md" title="Account settings">
          <div className={PATTERN_USER_SETTINGS_BODY_CLASS}>
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
                  {identity.lastSyncedLabel != null ? (
                    <p className={PATTERN_CONNECTION_META_CLASS}>
                      Last synced {identity.lastSyncedLabel}
                    </p>
                  ) : null}
                </div>
              </Card.Body>
            </Card>

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

            <div className={PATTERN_USER_SETTINGS_ACTIONS_CLASS}>
              <form action="/auth/sign-out" method="post">
                <Button type="submit" role="secondary" size="sm">
                  Sign out
                </Button>
              </form>
              <DisconnectControl />
              <Button
                role="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                {DELETE_ACCOUNT_ACTION}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog>
      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={DELETE_ACCOUNT_TITLE}
        description={DELETE_ACCOUNT_CONFIRM}
        cancelLabel={DELETE_ACCOUNT_CANCEL}
        confirmLabel={DELETE_ACCOUNT_ACTION}
        confirmRole="destructive"
        onConfirm={() => {
          setDeleteOpen(false);
          onOpenChange(false);
          deleteFormRef.current?.requestSubmit();
        }}
      />
      <form ref={deleteFormRef} action="/auth/disconnect" method="post" hidden />
    </>
  );
}

export function AccountSettings({ user, posts }: AccountSettingsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const identity = creatorIdentityFromUser(user, {
    lastSyncedAt: inventoryLastUpdated(posts),
  });

  return (
    <main className={PATTERN_PAGE_CLASS}>
      <div className={PATTERN_TOPBAR_BAND_CLASS}>
        <header className={PATTERN_TOPBAR_CLASS}>
          <span className={PATTERN_BRAND_CLASS}>PitchKit</span>
          <span />
          <span className={PATTERN_TOPBAR_END_CLASS}>
            <AccountSettingsAvatarButton
              identity={identity}
              open={settingsOpen}
              onClick={() => setSettingsOpen(true)}
            />
          </span>
        </header>
      </div>

      <AccountSettingsDialog
        user={user}
        posts={posts}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </main>
  );
}
