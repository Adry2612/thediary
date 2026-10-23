import assert from "node:assert/strict";
import test from "node:test";
import {
  CloudProviderError,
  normalizeCloudProviderError,
} from "../src/services/cloud-sync/provider.ts";

test("normalizes provider network errors as retryable", () => {
  const error = normalizeCloudProviderError(new TypeError("offline"));
  assert.equal(error.code, "network");
  assert.equal(error.retryable, true);
});

test("keeps provider error codes and retryability", () => {
  const error = new CloudProviderError("quota-exceeded", "Quota llena", true);
  assert.equal(normalizeCloudProviderError(error), error);
  assert.equal(error.retryable, true);
});
