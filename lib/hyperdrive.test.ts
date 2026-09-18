import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  LOCAL_CONNECTION_ENV,
  bindingFromUnknown,
  hasHyperdrive,
  hyperdriveFromEnv,
  readHyperdriveBinding,
  resetHyperdriveForTests,
  resolveHasHyperdrive,
  setHasHyperdriveForTests,
  setHyperdriveBindingForTests,
} from "./hyperdrive";

afterEach(() => {
  resetHyperdriveForTests();
});

describe("Hyperdrive binding detection", () => {
  it("is fail-closed in node:test without an explicit inject", async () => {
    assert.equal(hasHyperdrive(), false);
    assert.equal(await resolveHasHyperdrive(), false);
    assert.equal(await readHyperdriveBinding(), null);
    assert.equal(process.env.NODE_TEST_CONTEXT != null, true);
    assert.equal(bindingFromUnknown(undefined), null);
    assert.equal(bindingFromUnknown({}), null);
    assert.equal(bindingFromUnknown({ connectionString: "" }), null);
    assert.equal(bindingFromUnknown({ connectionString: "   " }), null);
    assert.equal(hyperdriveFromEnv(null), null);
    assert.equal(hyperdriveFromEnv({ HYPERDRIVE: { connectionString: "" } }), null);
  });

  it("accepts only a non-empty connectionString on HYPERDRIVE then PREVIEW", () => {
    assert.deepEqual(bindingFromUnknown({ connectionString: "postgresql://neon" }), {
      connectionString: "postgresql://neon",
    });
    assert.deepEqual(
      hyperdriveFromEnv({
        HYPERDRIVE: { connectionString: "postgresql://prod" },
        HYPERDRIVE_PREVIEW: { connectionString: "postgresql://preview" },
      }),
      { connectionString: "postgresql://prod" },
    );
    assert.deepEqual(
      hyperdriveFromEnv({
        HYPERDRIVE_PREVIEW: { connectionString: "postgresql://preview" },
      }),
      { connectionString: "postgresql://preview" },
    );
  });

  it("ignores HYPERDRIVE_LOCAL_CONNECTION_STRING inside node:test", async () => {
    const previous = process.env[LOCAL_CONNECTION_ENV];
    process.env[LOCAL_CONNECTION_ENV] = "postgresql://should-not-leak";
    try {
      assert.equal(await readHyperdriveBinding(), null);
      assert.equal(await resolveHasHyperdrive(), false);
    } finally {
      if (previous === undefined) {
        delete process.env[LOCAL_CONNECTION_ENV];
      } else {
        process.env[LOCAL_CONNECTION_ENV] = previous;
      }
    }
  });

  it("turns on only when a binding or flag is injected", async () => {
    setHyperdriveBindingForTests({ connectionString: "postgresql://injected" });
    assert.equal(hasHyperdrive(), true);
    assert.equal(await resolveHasHyperdrive(), true);
    assert.deepEqual(await readHyperdriveBinding(), { connectionString: "postgresql://injected" });

    resetHyperdriveForTests();
    setHasHyperdriveForTests(true);
    assert.equal(hasHyperdrive(), true);
    assert.equal(await resolveHasHyperdrive(), true);
    assert.equal(await readHyperdriveBinding(), null);

    setHasHyperdriveForTests(false);
    assert.equal(hasHyperdrive(), false);
  });
});
