import assert from "node:assert/strict";
import test from "node:test";
import { ATTACHMENT_TYPES } from "../src/types/practice-attachment.ts";
import { PRACTICE_RESOURCE_KINDS } from "../src/types/practice.ts";
import {
  ATTACHMENT_OPTIONS,
  MAX_IMAGE_BYTES,
} from "../src/utils/practice-attachments.ts";import { RESOURCE_LABELS } from "../src/utils/practice-resources.ts";

test("configures every attachment type with no gaps and no extras", () => {
  assert.deepEqual(
    Object.keys(ATTACHMENT_OPTIONS).sort(),
    [...ATTACHMENT_TYPES].sort(),
  );
});

test("every attachment type has a label, a heading and a default title", () => {
  for (const type of ATTACHMENT_TYPES) {
    const option = ATTACHMENT_OPTIONS[type];
    assert.ok(option.label.trim().length > 0, `${type} needs a label`);
    assert.ok(option.hint.trim().length > 0, `${type} needs a hint`);
    assert.ok(option.heading.trim().length > 0, `${type} needs a heading`);
    assert.ok(
      option.defaultTitle.trim().length > 0,
      `${type} needs a default title`,
    );
  }
});

test("every attachment type maps to an existing resource kind", () => {
  for (const type of ATTACHMENT_TYPES) {
    const option = ATTACHMENT_OPTIONS[type];
    assert.ok(
      PRACTICE_RESOURCE_KINDS.includes(option.resourceKind),
      `${type} maps to an unknown resource kind`,
    );
    assert.ok(
      RESOURCE_LABELS[option.resourceKind].trim().length > 0,
      `${type} resource kind has no label`,
    );
  }
});

test("url attachments require url copy and no file configuration", () => {
  for (const type of ATTACHMENT_TYPES) {
    const option = ATTACHMENT_OPTIONS[type];
    if (option.input !== "url") continue;

    assert.ok(option.url, `${type} needs url copy`);
    assert.ok(option.url.label.trim().length > 0, `${type} needs a url label`);
    assert.ok(
      option.url.placeholder.trim().length > 0,
      `${type} needs a url placeholder`,
    );
    assert.equal(option.accept, "");
    assert.deepEqual(option.fileKinds, []);
  }
});

test("file attachments accept at least one stored kind and explain errors", () => {
  for (const type of ATTACHMENT_TYPES) {
    const option = ATTACHMENT_OPTIONS[type];
    if (option.input === "url") continue;

    assert.ok(option.accept.trim().length > 0, `${type} needs an accept value`);
    assert.ok(option.fileHint.trim().length > 0, `${type} needs a file hint`);
    assert.ok(option.fileError.trim().length > 0, `${type} needs a file error`);
    assert.ok(option.fileKinds.length > 0, `${type} needs a stored kind`);
  }
});

test("image attachments cap the upload size and stay in the image kind", () => {
  const image = ATTACHMENT_OPTIONS.image;

  assert.equal(image.resourceKind, "image");
  assert.deepEqual(image.fileKinds, ["image"]);
  assert.equal(image.maxBytes, MAX_IMAGE_BYTES);
  assert.equal(MAX_IMAGE_BYTES, 10 * 1024 * 1024);
  assert.ok(image.sizeError?.trim().length);
});
