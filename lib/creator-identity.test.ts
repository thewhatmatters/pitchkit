import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  creatorIdentityFromUser,
  formatLastSyncedLabel,
  professionalAccountLabel,
} from "./creator-identity";
import { seedUsers } from "./seed";
import type { User } from "./schema";

function user(overrides: Partial<User> = {}): User {
  return { ...seedUsers[0]!, ...overrides };
}

describe("creator identity mapping", () => {
  it("maps seed Graph fields onto the identity strip", () => {
    const identity = creatorIdentityFromUser(user(), {
      lastSyncedAt: "2026-09-02T12:00:00.000Z",
    });
    assert.equal(identity.displayName, "Demo Creator");
    assert.equal(identity.handle, "demo");
    assert.equal(identity.profilePictureUrl, "/demo/avatar.svg");
    assert.equal(identity.followersCount, 10_000);
    assert.equal(identity.professionalAccount, "Business");
    assert.equal(identity.connected, true);
    assert.equal(identity.lastSyncedLabel, "Sep 2 at 12:00 PM");
    assert.equal("bio" in identity, false);
  });

  it("hides display name, photo, and last sync when missing", () => {
    const identity = creatorIdentityFromUser(
      user({
        name: "   ",
        avatar_r2_key: null,
        ig_account_type: null,
        connected_at: "",
      }),
      { lastSyncedAt: null },
    );
    assert.equal(identity.displayName, undefined);
    assert.equal(identity.profilePictureUrl, undefined);
    assert.equal(identity.professionalAccount, undefined);
    assert.equal(identity.lastSyncedLabel, undefined);
    assert.equal(identity.handle, "demo");
    assert.equal(identity.followersCount, 10_000);
  });

  it("labels Professional chips from Graph account_type and omits personal", () => {
    assert.equal(professionalAccountLabel("BUSINESS"), "Business");
    assert.equal(professionalAccountLabel("MEDIA_CREATOR"), "Creator");
    assert.equal(professionalAccountLabel("Media_Creator"), "Creator");
    assert.equal(professionalAccountLabel("Creator"), "Creator");
    assert.equal(professionalAccountLabel("PERSONAL"), undefined);
    assert.equal(professionalAccountLabel(null), undefined);
  });

  it("formats last synced from a stored stamp and hides invalid ones", () => {
    assert.equal(formatLastSyncedLabel("2026-09-07T12:42:00.000Z"), "Sep 7 at 12:42 PM");
    assert.equal(formatLastSyncedLabel("not-a-date"), undefined);
    assert.equal(formatLastSyncedLabel(null), undefined);
  });

  it("marks disconnected snapshots as not connected", () => {
    const identity = creatorIdentityFromUser(
      user({ disconnected_at: "2026-09-18T12:00:00.000Z" }),
    );
    assert.equal(identity.connected, false);
  });
});
