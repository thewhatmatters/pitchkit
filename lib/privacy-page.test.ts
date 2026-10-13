import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

describe("privacy policy draft", () => {
  const content = read("components/privacy-content.tsx");

  it("names the scopes, operator, contact, and the delete anchor", () => {
    assert.match(content, /instagram_business_basic/);
    assert.match(content, /instagram_business_manage_insights/);
    assert.match(content, /operated by WhatMatters/);
    assert.match(read("components/legal-page.tsx"), /mailto:randy@whatmatters\.so/);
    assert.match(content, /id="delete"/);
  });

  it("does not claim disconnect erases data (code only stamps and nulls tokens)", () => {
    for (const path of ["components/privacy-content.tsx", "app/delete/page.tsx", "app/data-deletion/page.tsx"]) {
      assert.doesNotMatch(read(path), /within 24 hours|Disconnect deletes your kit/);
    }
    assert.match(content, /does <strong>not<\/strong> yet erase/);
  });

  it("is marked a draft and uses WMDS only", () => {
    assert.match(read("components/legal-page.tsx"), /not legal advice/);
    assert.match(read("components/legal-page.tsx"), /from "@\/components\/wmds"/);
  });
});
