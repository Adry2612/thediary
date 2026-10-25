import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import {
  clearCatalogCache,
  searchCatalog,
} from "../src/services/catalog.ts";

beforeEach(() => clearCatalogCache());

function jsonResponse(body, ok = true, status = ok ? 200 : 500) {
  return { ok, status, json: async () => body };
}

function itunesPayload(title = "Master of Puppets") {
  return {
    results: [
      {
        trackId: 100,
        trackName: title,
        artistName: "Metallica",
        collectionName: "Master of Puppets",
        releaseDate: "1986-03-03T08:00:00Z",
        artworkUrl100: "https://example.com/100x100bb.jpg",
      },
    ],
  };
}

function deezerPayload(title = "Master of Puppets") {
  return {
    data: [
      {
        id: 200,
        title,
        artist: { name: "Metallica" },
        album: { title: "Master of Puppets", release_date: "1986-03-03" },
      },
    ],
  };
}

test("asks iTunes first and maps its payload", async () => {
  const urls = [];
  const outcome = await searchCatalog("master of puppets", {
    fetchImpl: async (url) => {
      urls.push(url);
      return jsonResponse(itunesPayload());
    },
  });

  assert.equal(urls.length, 1);
  assert.match(urls[0], /^https:\/\/itunes\.apple\.com\/search\?/);
  assert.match(urls[0], /term=master\+of\+puppets/);
  assert.equal(outcome.degraded, false);
  assert.equal(outcome.results[0].source, "itunes");
  assert.equal(outcome.results[0].releaseYear, 1986);
});

test("falls back to Deezer when iTunes fails", async () => {
  const urls = [];
  const outcome = await searchCatalog("master of puppets", {
    fetchImpl: async (url) => {
      urls.push(url);
      if (url.startsWith("https://itunes.apple.com")) {
        throw new Error("network down");
      }
      return jsonResponse(deezerPayload());
    },
  });

  assert.equal(urls.length, 2);
  assert.match(urls[1], /^https:\/\/api\.deezer\.com\/search\?/);
  assert.equal(outcome.degraded, false);
  assert.equal(outcome.results[0].source, "deezer");
});

test("falls back to Deezer when iTunes finds nothing", async () => {
  const urls = [];
  const outcome = await searchCatalog("noche rara", {
    fetchImpl: async (url) => {
      urls.push(url);
      return jsonResponse(
        url.startsWith("https://itunes.apple.com") ?
          { results: [] }
        : deezerPayload("Noche rara"),
      );
    },
  });

  assert.equal(urls.length, 2);
  assert.equal(outcome.results[0].title, "Noche rara");
});

test("reports a degraded search when both catalogs fail", async () => {
  const outcome = await searchCatalog("master of puppets", {
    fetchImpl: async () => {
      throw new Error("offline");
    },
  });

  assert.deepEqual(outcome, { results: [], degraded: true });
});

test("treats a fallback with no matches as an empty result, not an outage", async () => {
  const outcome = await searchCatalog("master of puppets", {
    fetchImpl: async (url) => {
      if (url.startsWith("https://itunes.apple.com")) throw new Error("down");
      return jsonResponse({ data: [] });
    },
  });

  assert.deepEqual(outcome, { results: [], degraded: false });
});

test("reports an outage when iTunes is empty and the fallback fails", async () => {
  const outcome = await searchCatalog("master of puppets", {
    fetchImpl: async (url) => {
      if (url.startsWith("https://itunes.apple.com")) {
        return jsonResponse({ results: [] });
      }
      throw new Error("down");
    },
  });

  assert.deepEqual(outcome, { results: [], degraded: true });
});

test("answers the second identical search from the cache", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return jsonResponse(itunesPayload());
  };

  const first = await searchCatalog("master of puppets", { fetchImpl });
  const second = await searchCatalog("  Master   of Puppets ", { fetchImpl });

  assert.equal(calls, 1);
  assert.deepEqual(second, first);
});

test("gives up after the per-catalog timeout instead of hanging", async () => {
  let calls = 0;
  const hangingFetch = (_url, init) => {
    calls += 1;
    return new Promise((_resolve, reject) => {
      init?.signal?.addEventListener(
        "abort",
        () => reject(new Error("aborted")),
        { once: true },
      );
    });
  };

  const outcome = await searchCatalog("master of puppets", {
    fetchImpl: hangingFetch,
    itunesTimeoutMs: 20,
    deezerTimeoutMs: 20,
  });

  assert.equal(calls, 2);
  assert.deepEqual(outcome, { results: [], degraded: true });
});

test("returns no results for an empty query without calling the catalogs", async () => {
  let calls = 0;
  const outcome = await searchCatalog("   ", {
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse(itunesPayload());
    },
  });

  assert.equal(calls, 0);
  assert.deepEqual(outcome, { results: [], degraded: false });
});

test("respects the requested limit", async () => {
  const payload = {
    results: Array.from({ length: 8 }, (_, index) => ({
      trackId: index,
      trackName: `Noche ${index}`,
      artistName: "Banda",
      collectionName: `Noche ${index}`,
    })),
  };

  const outcome = await searchCatalog("noche", {
    limit: 2,
    fetchImpl: async () => jsonResponse(payload),
  });

  assert.equal(outcome.results.length, 2);
});
