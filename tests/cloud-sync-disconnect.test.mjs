import assert from "node:assert/strict";
import test from "node:test";
import { GoogleDriveAdapter } from "../src/lib/cloud-sync/google-drive.ts";
import { OneDriveAdapter } from "../src/lib/cloud-sync/onedrive.ts";

test("disconnecting Google Drive revokes the session without deleting Drive files", async () => {
  const requests = [];
  const adapter = new GoogleDriveAdapter("google-token", async (url, init = {}) => {
    requests.push({ url: String(url), method: init.method ?? "GET" });
    return new Response(null, { status: 200 });
  });

  await adapter.disconnect();
  assert.equal(requests.length, 1);
  assert.match(requests[0].url, /oauth2\.googleapis\.com\/revoke/);
  assert.equal(requests.some(({ method, url }) => method === "DELETE" || url.includes("/files/")), false);
});

test("disconnecting OneDrive is local and does not issue a remote deletion", async () => {
  let called = false;
  const adapter = new OneDriveAdapter("one-token", async () => {
    called = true;
    return new Response(null, { status: 200 });
  });

  await adapter.disconnect();
  assert.equal(called, false);
});
