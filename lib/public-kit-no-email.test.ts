import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

function read(rel: string) {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

/** Everything that renders on /k/<handle>. Randy's rule: no public email or contact. */
const PUBLIC_KIT_SOURCES = [
  "app/k/[handle]/page.tsx",
  "components/shareable-kit.tsx",
  "components/support-footer.tsx",
];

const EMAIL_ADDRESS = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

describe("public kit has no email", () => {
  for (const rel of PUBLIC_KIT_SOURCES) {
    it(`${rel} has no mailto, email address or contact row`, () => {
      const source = read(rel);
      assert.doesNotMatch(source, /mailto:/i);
      assert.doesNotMatch(source, /SUPPORT_EMAIL/);
      assert.doesNotMatch(source, EMAIL_ADDRESS);
      assert.doesNotMatch(source, />\s*Email\s*</);
      assert.doesNotMatch(source, />\s*Contact\s*</);
      assert.doesNotMatch(source, /sourcedContactDetail|PATTERN_CONTACT_/);
    });
  }

  it("footer is Privacy and Help only", () => {
    const footer = read("components/support-footer.tsx");
    const links = [...footer.matchAll(/<TextLink href="([^"]+)">([^<]+)<\/TextLink>/g)].map(
      (m) => [m[1], m[2]],
    );
    assert.deepEqual(links, [
      ["/privacy", "Privacy"],
      ["/help", "Help"],
    ]);
  });

  it("help page exists and has no email", () => {
    const help = read("app/help/page.tsx");
    assert.doesNotMatch(help, /mailto:|SUPPORT_EMAIL/);
    assert.doesNotMatch(help, EMAIL_ADDRESS);
  });
});
