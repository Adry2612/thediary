import assert from "node:assert/strict";
import test from "node:test";
import { GoogleDriveAdapter } from "../src/services/cloud-sync/google-drive.ts";
import { OneDriveAdapter } from "../src/services/cloud-sync/onedrive.ts";

function response(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("Google Drive adapter uses bearer auth and uploads audio plus manifest", async () => {
  const requests = [];
  const adapter = new GoogleDriveAdapter("google-token", async (url, init = {}) => {
    requests.push({ url: String(url), init });
    if (String(url).includes("/about")) return response({ user: { emailAddress: "user@example.com" } });
    if (String(url).includes("/files?q=")) return response({ files: [] });
    if (String(url).endsWith("/files")) return response({ id: "folder-1" });
    if (String(url).includes("upload/drive/v3/files")) return response({ id: `file-${requests.length}` });
    return response({ files: [] });
  });

  const result = await adapter.uploadRecording({
    recording: {
      id: "recording-1",
      title: "Take",
      sessionName: "Session",
      createdAt: "2026-10-16T00:00:00.000Z",
      mimeType: "audio/webm",
    },
    blob: new Blob(["audio"], { type: "audio/webm" }),
  });
  assert.ok(result.remoteFileId);
  assert.ok(requests.every(({ init }) => init.headers.Authorization === "Bearer google-token"));
  assert.equal(requests.filter(({ url }) => url.includes("upload/drive/v3/files")).length, 2);
});

test("OneDrive adapter uploads the stable recording and manifest paths", async () => {
  const urls = [];
  const adapter = new OneDriveAdapter("one-token", async (url) => {
    urls.push(String(url));
    return response({ id: `item-${urls.length}` });
  });
  const result = await adapter.uploadRecording({
    recording: {
      id: "recording-2",
      title: "Take",
      sessionName: "Session",
      createdAt: "2026-10-16T00:00:00.000Z",
      mimeType: "audio/mp4",
    },
    blob: new Blob(["audio"], { type: "audio/mp4" }),
  });
  assert.ok(result.remoteFileId);
  assert.match(urls[0], /TheDiary%2FRecordings%2Frecording-2\.mp4/);
  assert.match(urls[1], /TheDiary%2FRecordings%2Frecording-2\.json/);
});

test("Google Drive adapter exposes an app-proxied playback URL for managed recordings", async () => {
  const adapter = new GoogleDriveAdapter("google-token", async (url) => {
    const value = String(url);
    if (value.includes("TheDiary")) return response({ files: [{ id: "root-folder" }] });
    if (value.includes("Recordings")) return response({ files: [{ id: "recordings-folder" }] });
    if (value.includes(".json")) return response({ files: [{ id: "manifest-1", name: "recording-1.json" }] });
    if (value.includes("/files/manifest-1")) {
      return response({
        version: 1,
        audioFileId: "audio-1",
        recording: {
          id: "recording-1",
          title: "Take",
          sessionName: "Session",
          createdAt: "2026-10-16T00:00:00.000Z",
          mimeType: "audio/webm",
        },
      });
    }
    return response({});
  });

  const recordings = await adapter.listManagedRecordings();
  assert.equal(recordings.length, 1);
  assert.equal(recordings[0].remoteFileId, "audio-1");
  assert.equal(
    recordings[0].downloadUrl,
    "/api/cloud-sync/google-drive/recordings/audio?fileId=audio-1",
  );
});

test("Google Drive adapter forwards the Range header when downloading managed audio", async () => {
  const requests = [];
  const adapter = new GoogleDriveAdapter("google-token", async (url, init = {}) => {
    requests.push({ url: String(url), init });
    return new Response("binary", {
      status: 206,
      headers: {
        "Content-Type": "audio/webm",
        "Content-Range": "bytes 0-5/6",
        "Content-Length": "6",
      },
    });
  });

  const download = await adapter.downloadRecording("audio-1", "bytes=0-5");

  assert.equal(download.status, 206);
  assert.equal(download.contentType, "audio/webm");
  assert.equal(download.contentRange, "bytes 0-5/6");
  assert.equal(requests[0].init.headers.Authorization, "Bearer google-token");
  assert.equal(requests[0].init.headers.Range, "bytes=0-5");
  assert.match(requests[0].url, /\/files\/audio-1\?alt=media/);
});
