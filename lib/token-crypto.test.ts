import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decryptToken, encryptToken } from "./token-crypto";

describe("TOKEN_KEY at rest", () => {
  it("round-trips a token and fails closed without the key", async () => {
    const cipher = await encryptToken("IGQVJexample", "unit-test-token-key");
    assert.match(cipher, /^v1\./);
    assert.equal(await decryptToken(cipher, "unit-test-token-key"), "IGQVJexample");
    assert.equal(await decryptToken(cipher, "wrong-key"), null);
    assert.equal(await decryptToken(null, "unit-test-token-key"), null);
    assert.doesNotMatch(cipher, /IGQVJexample/);
  });
});
