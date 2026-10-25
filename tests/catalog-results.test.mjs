import assert from "node:assert/strict";
import test from "node:test";
import {
  clampCatalogLimit,
  isCatalogQueryValid,
  mergeCandidates,
  normalizeCatalogQuery,
  parseDeezerResults,
  parseItunesResults,
  parseReleaseYear,
  upgradeArtworkUrl,
} from "../src/utils/catalog-results.ts";

function itunesTrack(overrides = {}) {
  return {
    wrapperType: "track",
    kind: "song",
    trackId: 100,
    trackName: "Master of Puppets",
    artistName: "Metallica",
    collectionName: "Master of Puppets",
    releaseDate: "1986-03-03T08:00:00Z",
    artworkUrl100:
      "https://is1-ssl.mzstatic.com/image/thumb/Music/100x100bb.jpg",
    ...overrides,
  };
}

/**
 * El orden real que devolvió iTunes para «master of puppets», recortado a
 * diez entradas. Es la referencia del comportamiento: el proveedor ya pone
 * arriba la versión de Metallica y No. el resto es ruido alrededor.
 */
const MASTER_OF_PUPPETS = [
  { trackId: 1, trackName: "Master of Puppets", artistName: "Metallica", collectionName: "Master of Puppets (Deluxe Box Set)", releaseDate: "1986-01-01T00:00:00Z" },
  { trackId: 2, trackName: "Master of Puppets (Live)", artistName: "Metallica", collectionName: "Metallica Through the Never", releaseDate: "2013-01-01T00:00:00Z" },
  { trackId: 3, trackName: "Master of Puppets (Bonus Track)", artistName: "Trivium", collectionName: "Ascendancy", releaseDate: "2006-01-01T00:00:00Z" },
  { trackId: 4, trackName: "Master of Puppets (Live)", artistName: "Metallica & San Francisco Symphony", collectionName: "S&M2 (Live)", releaseDate: "2020-01-01T00:00:00Z" },
  { trackId: 5, trackName: "Master of Puppets", artistName: "Steve ‘n’ Seagulls", collectionName: "Another Miracle", releaseDate: "2020-01-01T00:00:00Z" },
  { trackId: 6, trackName: "Master of Puppets (Español)", artistName: "Nico Borie", collectionName: "Master of Puppets (Español) - Single", releaseDate: "2021-01-01T00:00:00Z" },
  { trackId: 7, trackName: "Master of Puppets", artistName: "Metallica", collectionName: "Master of Puppets (Remastered)", releaseDate: "1986-01-01T00:00:00Z" },
  { trackId: 8, trackName: "Master of Puppets", artistName: "Rockabye Baby!", collectionName: "Lullaby Renditions of Metallica", releaseDate: "2006-01-01T00:00:00Z" },
  { trackId: 9, trackName: "Master of Puppets", artistName: "Metallica", collectionName: "Stranger Things: Soundtrack", releaseDate: "1986-01-01T00:00:00Z" },
  { trackId: 10, trackName: "Master of Puppets", artistName: "Van Canto", collectionName: "Tribe of Force", releaseDate: "2010-01-01T00:00:00Z" },
];

test("normalizes the query to a single line", () => {
  assert.equal(normalizeCatalogQuery("  master   of\npuppets "), "master of puppets");
});

test("requires at least two characters", () => {
  assert.equal(isCatalogQueryValid(" a "), false);
  assert.equal(isCatalogQueryValid(" ab "), true);
});

test("clamps the limit into the supported range", () => {
  assert.equal(clampCatalogLimit(undefined), 5);
  assert.equal(clampCatalogLimit("0"), 1);
  assert.equal(clampCatalogLimit("99"), 8);
  assert.equal(clampCatalogLimit("3"), 3);
  assert.equal(clampCatalogLimit("nope"), 5);
});

test("upgrades the iTunes artwork to 600 px", () => {
  assert.equal(
    upgradeArtworkUrl("https://example.com/art/100x100bb.jpg"),
    "https://example.com/art/600x600bb.jpg",
  );
});

test("leaves an already large artwork untouched", () => {
  assert.equal(
    upgradeArtworkUrl("https://example.com/art/1000x1000-000000-80-0-0.jpg"),
    "https://example.com/art/1000x1000-000000-80-0-0.jpg",
  );
});

test("rejects artwork that is not an https URL", () => {
  assert.equal(upgradeArtworkUrl("http://example.com/100x100bb.jpg"), undefined);
  assert.equal(upgradeArtworkUrl("cover.jpg"), undefined);
  assert.equal(upgradeArtworkUrl(null), undefined);
});

test("reads the release year from an ISO date or a bare year", () => {
  assert.equal(parseReleaseYear("1986-03-03T08:00:00Z"), 1986);
  assert.equal(parseReleaseYear("1986"), 1986);
  assert.equal(parseReleaseYear(1986), 1986);
});

test("ignores a missing or impossible release date", () => {
  assert.equal(parseReleaseYear(undefined), undefined);
  assert.equal(parseReleaseYear(""), undefined);
  assert.equal(parseReleaseYear("March 1986"), undefined);
  assert.equal(parseReleaseYear("1200-01-01"), undefined);
});

test("parses an iTunes payload", () => {
  const [candidate] = parseItunesResults({ results: [itunesTrack()] });

  assert.deepEqual(candidate, {
    source: "itunes",
    id: "100",
    title: "Master of Puppets",
    artist: "Metallica",
    album: "Master of Puppets",
    releaseYear: 1986,
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music/600x600bb.jpg",
  });
});

test("skips iTunes entries without title, artist or id", () => {
  const candidates = parseItunesResults({
    results: [
      itunesTrack({ trackName: undefined }),
      itunesTrack({ artistName: "" }),
      itunesTrack({ trackId: undefined }),
      itunesTrack(),
    ],
  });

  assert.equal(candidates.length, 1);
});

test("returns nothing for a malformed iTunes payload", () => {
  assert.deepEqual(parseItunesResults(null), []);
  assert.deepEqual(parseItunesResults({}), []);
  assert.deepEqual(parseItunesResults({ results: "nope" }), []);
  assert.deepEqual(parseItunesResults({ results: [null, 42] }), []);
});

test("parses a Deezer payload", () => {
  const [candidate] = parseDeezerResults({
    data: [
      {
        id: 200,
        title: "Master of Puppets",
        artist: { name: "Metallica" },
        album: {
          title: "Master of Puppets",
          release_date: "1986-03-03",
          cover_xl: "https://cdn-images.dzcdn.net/1000x1000.jpg",
        },
      },
    ],
  });

  assert.equal(candidate.source, "deezer");
  assert.equal(candidate.releaseYear, 1986);
  assert.equal(candidate.coverUrl, "https://cdn-images.dzcdn.net/1000x1000.jpg");
});

test("keeps a candidate without release date or artwork", () => {
  const [candidate] = parseDeezerResults({
    data: [{ id: 1, title: "Suena raro", artist: { name: "Banda" } }],
  });

  assert.equal("releaseYear" in candidate, false);
  assert.equal("coverUrl" in candidate, false);
});

test("returns nothing for a malformed Deezer payload", () => {
  assert.deepEqual(parseDeezerResults(undefined), []);
  assert.deepEqual(parseDeezerResults({ data: {} }), []);
  assert.deepEqual(parseDeezerResults({ data: [null] }), []);
});

test("keeps the provider order so the original band leads", () => {
  const primary = parseItunesResults({ results: MASTER_OF_PUPPETS });
  const merged = mergeCandidates({ primary, limit: 8 });

  assert.equal(merged[0].title, "Master of Puppets");
  assert.equal(merged[0].artist, "Metallica");
  assert.equal(merged[0].album, "Master of Puppets (Deluxe Box Set)");
});

test("collapses the same title and artist even when the album differs", () => {
  const primary = parseItunesResults({ results: MASTER_OF_PUPPETS });
  const merged = mergeCandidates({ primary, limit: 8 });

  const metallica = merged.filter(
    (candidate) =>
      candidate.title === "Master of Puppets" &&
      candidate.artist === "Metallica",
  );

  assert.equal(metallica.length, 1);
  assert.equal(merged.length, 8);
  assert.deepEqual(
    merged.map((candidate) => candidate.artist),
    [
      "Metallica",
      "Metallica",
      "Trivium",
      "Metallica & San Francisco Symphony",
      "Steve ‘n’ Seagulls",
      "Nico Borie",
      "Rockabye Baby!",
      "Van Canto",
    ],
  );
});

test("lists each version of a different artist in the provider's order", () => {
  const primary = [
    { source: "itunes", id: "cover", title: "Noche", artist: "Banda tributo" },
    { source: "itunes", id: "original", title: "Noche", artist: "Banda" },
  ];

  assert.deepEqual(
    mergeCandidates({ primary }).map((candidate) => candidate.id),
    ["cover", "original"],
  );
});

test("does not reorder the answer by release year", () => {
  const primary = [
    {
      source: "itunes",
      id: "old",
      title: "Noche",
      artist: "Banda vieja",
      album: "Uno",
      releaseYear: 1990,
    },
    {
      source: "itunes",
      id: "new",
      title: "Noche",
      artist: "Banda nueva",
      album: "Dos",
      releaseYear: 2024,
    },
  ];

  assert.deepEqual(
    mergeCandidates({ primary }).map((candidate) => candidate.id),
    ["old", "new"],
  );
});

test("removes duplicates coming from both catalogs", () => {
  const primary = parseItunesResults({ results: [itunesTrack()] });
  const fallback = [
    {
      source: "deezer",
      id: "200",
      title: "  master of puppets ",
      artist: "metallica",
      album: "Otro álbum",
    },
  ];

  const merged = mergeCandidates({ primary, fallback });

  assert.equal(merged.length, 1);
  assert.equal(merged[0].source, "itunes");
});

test("collapses accents and case in the duplicate key", () => {
  const primary = [
    {
      source: "itunes",
      id: "1",
      title: "Corazón Partío",
      artist: "Alejandro Sanz",
    },
    {
      source: "itunes",
      id: "2",
      title: "corazon partio",
      artist: "alejandro  sanz",
    },
  ];

  assert.deepEqual(
    mergeCandidates({ primary }).map((candidate) => candidate.id),
    ["1"],
  );
});

test("appends the fallback after the primary and keeps its order", () => {
  const primary = [
    { source: "itunes", id: "a", title: "Uno", artist: "Banda" },
  ];
  const fallback = [
    { source: "deezer", id: "b", title: "Dos", artist: "Banda" },
    { source: "deezer", id: "c", title: "Tres", artist: "Banda" },
  ];

  assert.deepEqual(
    mergeCandidates({ primary, fallback }).map((candidate) => candidate.id),
    ["a", "b", "c"],
  );
});

test("keeps the fallback order when it is the only source", () => {
  const fallback = [
    { source: "deezer", id: "1", title: "Noche", artist: "Banda" },
    { source: "deezer", id: "2", title: "Noche", artist: "Otra banda" },
  ];

  assert.deepEqual(
    mergeCandidates({ primary: [], fallback }).map((candidate) => candidate.id),
    ["1", "2"],
  );
});

test("respects the requested limit", () => {
  const primary = Array.from({ length: 10 }, (_, index) => ({
    source: "itunes",
    id: String(index),
    title: `Canción ${index}`,
    artist: "Banda",
  }));

  assert.equal(mergeCandidates({ primary, limit: 3 }).length, 3);
  assert.equal(mergeCandidates({ primary }).length, 5);
});

test("returns nothing when both catalogs come empty", () => {
  assert.deepEqual(mergeCandidates({ primary: [] }), []);
  assert.deepEqual(mergeCandidates({ primary: [], fallback: [] }), []);
});
