import assert from "node:assert/strict";
import test from "node:test";
import { isUnsupportedMimeTypeError } from "../src/utils/storage-error.ts";

test("recognises a bucket rejection for an unsupported MIME type", () => {
  assert.equal(
    isUnsupportedMimeTypeError({
      statusCode: "415",
      message: "mime type image/png is not supported",
    }),
    true,
  );
  assert.equal(
    isUnsupportedMimeTypeError({
      statusCode: 415,
      message: "invalid_mime_type",
    }),
    true,
  );
});

test("ignores other storage errors", () => {
  assert.equal(
    isUnsupportedMimeTypeError({
      statusCode: "403",
      message: "new row violates row-level security policy",
    }),
    false,
  );
  assert.equal(isUnsupportedMimeTypeError({ message: "Bucket not found" }), false);
});
