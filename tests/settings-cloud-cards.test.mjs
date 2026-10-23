import test from "node:test";
import assert from "node:assert/strict";
import { buildCloudSyncCards } from "../src/utils/settings.ts";

const messages = {
  signOutError: "sign out",
  providerUnavailable: "not configured",
  connectionFailed: "failed",
  connectionSuccess: "success",
  connected: "connected",
  connect: "connect",
  disconnect: "disconnect",
  syncNotConnected: "not connected",
  googleDrive: "Google Drive",
  onedrive: "OneDrive",
};

test("builds a connect action for an enabled but disconnected provider", () => {
  const [card] = buildCloudSyncCards(
    [{ provider: "google-drive", enabled: true, connected: false }],
    {
      messages,
      connectedProvider: null,
      isLoading: false,
      workingProvider: null,
    },
  );

  assert.equal(card.label, "Google Drive");
  assert.equal(card.statusText, "not connected");
  assert.equal(card.actionLabel, "connect");
  assert.equal(card.isHighlighted, false);
});

test("highlights the provider that has just connected", () => {
  const [card] = buildCloudSyncCards(
    [
      {
        provider: "onedrive",
        enabled: true,
        connected: true,
        accountLabel: "me@example.com",
      },
    ],
    {
      messages,
      connectedProvider: "onedrive",
      isLoading: false,
      workingProvider: null,
    },
  );

  assert.equal(card.statusText, "connected · me@example.com");
  assert.equal(card.actionLabel, "success");
  assert.equal(card.isHighlighted, true);
});

test("disables every action while a provider is working", () => {
  const cards = buildCloudSyncCards(
    [
      { provider: "google-drive", enabled: true, connected: false },
      { provider: "onedrive", enabled: false, connected: false },
    ],
    {
      messages,
      connectedProvider: null,
      isLoading: false,
      workingProvider: "google-drive",
    },
  );

  assert.equal(cards[0].isDisabled, true);
  assert.equal(cards[1].isDisabled, true);
  assert.equal(cards[1].statusText, "not configured");
});
