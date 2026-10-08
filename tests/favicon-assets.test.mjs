import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const publicPath = new URL("../public/", import.meta.url);
const iconFiles = [
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
];

test("provides the favicon assets referenced by the app manifest", async () => {
  await Promise.all(
    iconFiles.map((filename) => readFile(new URL(filename, publicPath))),
  );

  const manifest = JSON.parse(
    await readFile(new URL("site.webmanifest", publicPath), "utf8"),
  );

  assert.equal(manifest.name, "thediary");
  assert.equal(manifest.short_name, "thediary");
  assert.deepEqual(
    manifest.icons.map(({ src, sizes }) => ({ src, sizes })),
    [
      { src: "/android-chrome-192x192.png?v=4", sizes: "192x192" },
      { src: "/android-chrome-512x512.png?v=4", sizes: "512x512" },
    ],
  );
});
