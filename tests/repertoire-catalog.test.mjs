import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCatalogFillUpdates,
  buildCatalogQuery,
  normalizeCatalogMetadata,
} from "../src/utils/repertoire-catalog.ts";

const CURRENT_YEAR = 2026;

test("keeps a complete, valid set of metadata", () => {
  assert.deepEqual(
    normalizeCatalogMetadata(
      {
        album: "  Master of Puppets ",
        releaseYear: 1986,
        coverUrl: "https://is1-ssl.mzstatic.com/image/600x600bb.jpg",
        catalogSource: "itunes",
        catalogId: "12345",
      },
      CURRENT_YEAR,
    ),
    {
      album: "Master of Puppets",
      releaseYear: 1986,
      coverUrl: "https://is1-ssl.mzstatic.com/image/600x600bb.jpg",
      catalogSource: "itunes",
      catalogId: "12345",
    },
  );
});

test("drops every empty field", () => {
  assert.deepEqual(
    normalizeCatalogMetadata(
      {
        album: "   ",
        releaseYear: undefined,
        coverUrl: "",
        catalogId: " ",
      },
      CURRENT_YEAR,
    ),
    {},
  );
});

test("collapses inner whitespace in the album", () => {
  assert.equal(
    normalizeCatalogMetadata(
      { album: "Use   Your Illusion  II" },
      CURRENT_YEAR,
    ).album,
    "Use Your Illusion II",
  );
});

test("caps the album at 120 characters", () => {
  const album = normalizeCatalogMetadata(
    { album: "a".repeat(200) },
    CURRENT_YEAR,
  ).album;

  assert.equal(album?.length, 120);
});

test("rejects a release year outside the supported range", () => {
  assert.equal(
    normalizeCatalogMetadata({ releaseYear: 1899 }, CURRENT_YEAR).releaseYear,
    undefined,
  );
  assert.equal(
    normalizeCatalogMetadata({ releaseYear: 2028 }, CURRENT_YEAR).releaseYear,
    undefined,
  );
  assert.equal(
    normalizeCatalogMetadata({ releaseYear: 1986.5 }, CURRENT_YEAR).releaseYear,
    undefined,
  );
});

test("accepts the current year and the next one", () => {
  assert.equal(
    normalizeCatalogMetadata({ releaseYear: CURRENT_YEAR }, CURRENT_YEAR)
      .releaseYear,
    CURRENT_YEAR,
  );
  assert.equal(
    normalizeCatalogMetadata({ releaseYear: CURRENT_YEAR + 1 }, CURRENT_YEAR)
      .releaseYear,
    CURRENT_YEAR + 1,
  );
});

test("rejects artwork that is not https or not a URL", () => {
  assert.equal(
    normalizeCatalogMetadata(
      { coverUrl: "http://example.com/cover.jpg" },
      CURRENT_YEAR,
    ).coverUrl,
    undefined,
  );
  assert.equal(
    normalizeCatalogMetadata({ coverUrl: "not a url" }, CURRENT_YEAR).coverUrl,
    undefined,
  );
});

test("rejects artwork longer than 500 characters", () => {
  const coverUrl = `https://example.com/${"a".repeat(500)}.jpg`;

  assert.equal(
    normalizeCatalogMetadata({ coverUrl }, CURRENT_YEAR).coverUrl,
    undefined,
  );
});

test("keeps only known catalog sources", () => {
  assert.equal(
    // @ts-expect-error: se comprueba el caso de un valor no admitido.
    normalizeCatalogMetadata({ catalogSource: "spotify" }, CURRENT_YEAR)
      .catalogSource,
    undefined,
  );
});

test("caps the catalog identifier at 120 characters", () => {
  const catalogId = normalizeCatalogMetadata(
    { catalogId: "9".repeat(300) },
    CURRENT_YEAR,
  ).catalogId;

  assert.equal(catalogId?.length, 120);
});

const candidate = {
  source: "itunes",
  id: "1440811252",
  title: "Hurt",
  artist: "Johnny Cash",
  album: "American IV: The Man Comes Around",
  releaseYear: 2002,
  coverUrl: "https://example.com/600x600bb.jpg",
};

test("fills the gaps of an existing song from a candidate", () => {
  assert.deepEqual(
    buildCatalogFillUpdates({}, candidate, "2026-10-25T00:00:00.000Z"),
    {
      album: "American IV: The Man Comes Around",
      releaseYear: 2002,
      coverUrl: "https://example.com/600x600bb.jpg",
      catalogSource: "itunes",
      catalogId: "1440811252",
      updatedAt: "2026-10-25T00:00:00.000Z",
    },
  );
});

test("keeps the values a song already has", () => {
  const updates = buildCatalogFillUpdates(
    {
      album: "Mi álbum",
      releaseYear: 1999,
      coverUrl: "https://example.com/mia.jpg",
    },
    candidate,
    "2026-10-25T00:00:00.000Z",
  );

  assert.equal(updates, null);
});

test("fills only what is missing when the song is partially complete", () => {
  const updates = buildCatalogFillUpdates(
    { album: "Mi álbum" },
    candidate,
    "2026-10-25T00:00:00.000Z",
  );

  assert.equal(updates.album, undefined);
  assert.equal(updates.releaseYear, 2002);
  assert.equal(updates.coverUrl, "https://example.com/600x600bb.jpg");
});

test("never writes the fields the song owns", () => {
  const updates = buildCatalogFillUpdates(
    {},
    candidate,
    "2026-10-25T00:00:00.000Z",
  );

  for (const forbidden of [
    "title",
    "artist",
    "tuning",
    "capo",
    "parts",
    "chordChart",
    "tab",
  ]) {
    assert.equal(forbidden in updates, false);
  }
});

test("returns null when the candidate carries nothing to fill", () => {
  const updates = buildCatalogFillUpdates(
    {},
    { source: "itunes", id: "1", title: "Hurt", artist: "Johnny Cash" },
    "2026-10-25T00:00:00.000Z",
  );

  assert.equal(updates, null);
});

test("builds the lookup query from the title and the artist", () => {
  assert.equal(buildCatalogQuery("  Hurt  ", "Johnny Cash"), "Hurt Johnny Cash");
  assert.equal(buildCatalogQuery("Hurt", undefined), "Hurt");
  assert.equal(buildCatalogQuery(undefined, "Johnny Cash"), "Johnny Cash");
});

test("returns an empty lookup query when there is nothing to search", () => {
  assert.equal(buildCatalogQuery(undefined, undefined), "");
  assert.equal(buildCatalogQuery("   ", ""), "");
});

test("collapses inner whitespace in the lookup query", () => {
  assert.equal(
    buildCatalogQuery("Nothing   Else\tMatters", " Metallica "),
    "Nothing Else Matters Metallica",
  );
});
