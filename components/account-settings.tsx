"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CreatorIdentityStrip } from "@/components/creator-identity-strip";
import { SupportFooter } from "@/components/support-footer";
import {
  PATTERN_ACCOUNT_MENU_CLASS,
  PATTERN_ACCOUNT_MENU_HEADER_CLASS,
  PATTERN_ACCOUNT_MENU_PANEL_CLASS,
  PATTERN_ACCOUNT_MENU_SEPARATOR_CLASS,
  PATTERN_ACCOUNT_MENU_TRIGGER_CLASS,
  PATTERN_BRAND_CLASS,
  PATTERN_CONNECTION_META_CLASS,
  PATTERN_PAGE_CLASS,
  PATTERN_SETTINGS_BODY_CLASS,
  PATTERN_SETTINGS_CARD_CLASS,
  PATTERN_TOPBAR_BAND_CLASS,
  PATTERN_TOPBAR_CLASS,
  PATTERN_TOPBAR_END_CLASS,
  PATTERN_USER_SETTINGS_BODY_CLASS,
} from "@/components/pattern-tokens";
import { copyKitLink } from "@/components/share-kit-button";
import {
  AlertDialog,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Dropdown,
  cardTitleClasses,
} from "@/components/wmds";
import {
  ACCOUNT_MENU_LABEL,
  ACCOUNT_SETTINGS_ACTION,
  DELETE_ACCOUNT_ACTION,
  DELETE_ACCOUNT_CANCEL,
  DELETE_ACCOUNT_CONFIRM,
  DELETE_ACCOUNT_TITLE,
  DISCONNECT_CONFIRM,
  DISCONNECT_INSTAGRAM_ACTION,
  DISCONNECT_KEEP,
  DISCONNECT_TITLE,
  RECONNECT_INSTAGRAM_ACTION,
} from "@/lib/copy";
import { creatorIdentityFromUser } from "@/lib/creator-identity";
import { inventoryLastUpdated } from "@/lib/inventory";
import type { Media, User } from "@/lib/schema";

type AccountSettingsProps = {
  user: User;
  posts: Media[];
};

type AccountSettingsDialogProps = AccountSettingsProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type AccountMenuProps = AccountSettingsProps & {
  /** `/settings` lands on the Dialog instead of a blank chrome page. */
  defaultSettingsOpen?: boolean;
};

/**
 * Pattern — account settings (owner)
 * (`examples-pitchkit--account-settings-owner` at 9f06fb6).
 * Header Avatar opens a structured Dropdown. Dialog is Connected Instagram
 * plus Reconnect. Account actions live on the menu. Delete confirm is the
 * RE memo copy.
 */

export function AccountMenu({
  user,
  posts,
  defaultSettingsOpen = false,
}: AccountMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const signOutFormRef = useRef<HTMLFormElement>(null);
  const disconnectFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const identity = creatorIdentityFromUser(user, {
    lastSyncedAt: inventoryLastUpdated(posts),
  });
  const avatarName = identity.displayName ?? identity.handle;

  useEffect(() => {
    if (defaultSettingsOpen) {
      setSettingsOpen(true);
    }
  }, [defaultSettingsOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current != null && !rootRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <div ref={rootRef} className={PATTERN_ACCOUNT_MENU_CLASS}>
        <Button
          type="button"
          role="ghost"
          size="sm"
          className={PATTERN_ACCOUNT_MENU_TRIGGER_CLASS}
          aria-label={ACCOUNT_MENU_LABEL}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? menuId : undefined}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Avatar name={avatarName} src={identity.profilePictureUrl} size="md" />
        </Button>
        {menuOpen ? (
          <Dropdown.Menu
            id={menuId}
            role="menu"
            aria-label={ACCOUNT_MENU_LABEL}
            className={PATTERN_ACCOUNT_MENU_PANEL_CLASS}
          >
            <li role="presentation">
              <p className={PATTERN_ACCOUNT_MENU_HEADER_CLASS}>{ACCOUNT_MENU_LABEL}</p>
            </li>
            <li role="presentation">
              <Dropdown.Item
                role="menuitem"
                truncate={false}
                onClick={() => {
                  closeMenu();
                  setSettingsOpen(true);
                }}
              >
                {ACCOUNT_SETTINGS_ACTION}
              </Dropdown.Item>
            </li>
            <li role="presentation">
              <Dropdown.Item
                role="menuitem"
                truncate={false}
                onClick={() => {
                  closeMenu();
                  void copyKitLink(identity.handle);
                }}
              >
                Share kit
              </Dropdown.Item>
            </li>
            <li role="separator" className={PATTERN_ACCOUNT_MENU_SEPARATOR_CLASS} />
            <li role="presentation">
              <Dropdown.Item
                role="menuitem"
                truncate={false}
                onClick={() => {
                  closeMenu();
                  signOutFormRef.current?.requestSubmit();
                }}
              >
                Sign out
              </Dropdown.Item>
            </li>
            <li role="presentation">
              <Dropdown.Item
                role="menuitem"
                truncate={false}
                onClick={() => {
                  closeMenu();
                  setDisconnectOpen(true);
                }}
              >
                {DISCONNECT_INSTAGRAM_ACTION}
              </Dropdown.Item>
            </li>
            <li role="presentation">
              <Dropdown.Item
                role="menuitem"
                truncate={false}
                onClick={() => {
                  closeMenu();
                  setDeleteOpen(true);
                }}
              >
                {DELETE_ACCOUNT_ACTION}
              </Dropdown.Item>
            </li>
          </Dropdown.Menu>
        ) : null}
      </div>
      <AccountSettingsDialog
        user={user}
        posts={posts}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
      <AlertDialog
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title={DISCONNECT_TITLE}
        description={DISCONNECT_CONFIRM}
        cancelLabel={DISCONNECT_KEEP}
        confirmLabel="Disconnect"
        onConfirm={() => {
          disconnectFormRef.current?.requestSubmit();
        }}
      />
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
          setSettingsOpen(false);
          deleteFormRef.current?.requestSubmit();
        }}
      />
      <form ref={signOutFormRef} action="/auth/sign-out" method="post" hidden />
      <form ref={disconnectFormRef} action="/auth/disconnect" method="post" hidden />
      <form ref={deleteFormRef} action="/auth/disconnect" method="post" hidden />
    </>
  );
}

export function AccountSettingsDialog({
  user,
  posts,
  open,
  onOpenChange,
}: AccountSettingsDialogProps) {
  const identity = creatorIdentityFromUser(user, {
    lastSyncedAt: inventoryLastUpdated(posts),
  });

  return (
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
                <form action="/auth/instagram" method="post">
                  <Button type="submit" role="secondary" size="sm">
                    {RECONNECT_INSTAGRAM_ACTION}
                  </Button>
                </form>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

export function AccountSettings({ user, posts }: AccountSettingsProps) {
  return (
    <main className={PATTERN_PAGE_CLASS}>
      <div className={PATTERN_TOPBAR_BAND_CLASS}>
        <header className={PATTERN_TOPBAR_CLASS}>
          <span className={PATTERN_BRAND_CLASS}>PitchKit</span>
          <span />
          <span className={PATTERN_TOPBAR_END_CLASS}>
            <AccountMenu user={user} posts={posts} defaultSettingsOpen />
          </span>
        </header>
      </div>
      <SupportFooter />
    </main>
  );
}
