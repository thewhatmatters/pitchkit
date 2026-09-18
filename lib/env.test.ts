import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_GRAPH_API_VERSION,
  emptySecrets,
  hasLiveAuthSecrets,
  readProcessSecrets,
  secretsFromRecord,
  setSecretsForTests,
} from "./env";

describe("secrets", () => {
  it("pins v25.0 and does not float latest", () => {
    assert.equal(secretsFromRecord({}).GRAPH_API_VERSION, DEFAULT_GRAPH_API_VERSION);
    assert.equal(secretsFromRecord({ GRAPH_API_VERSION: "latest" }).GRAPH_API_VERSION, "v25.0");
    assert.equal(secretsFromRecord({ GRAPH_API_VERSION: "25.0" }).GRAPH_API_VERSION, "v25.0");
  });

  it("treats live Auth as off when app id/secret are missing", () => {
    assert.equal(hasLiveAuthSecrets(emptySecrets()), false);
    assert.equal(
      hasLiveAuthSecrets({ ...emptySecrets(), IG_APP_ID: "1", IG_APP_SECRET: "2" }),
      true,
    );
  });

  it("ignores process env inside node:test unless injected", () => {
    setSecretsForTests(undefined);
    const secrets = readProcessSecrets();
    assert.equal(secrets.IG_USER_TOKEN, null);
    assert.equal(secrets.IG_APP_SECRET, null);
    setSecretsForTests({ ...emptySecrets(), IG_USER_TOKEN: "injected" });
    assert.equal(readProcessSecrets().IG_USER_TOKEN, "injected");
    setSecretsForTests(undefined);
  });
});
