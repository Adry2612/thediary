import assert from "node:assert/strict";
import test from "node:test";
import {
  collectPracticedCatalogSongs,
  getCatalogSongKey,
} from "../src/utils/practice-catalog-songs.ts";

const first = {
  source: "itunes",
  id: "song-1",
  title: "Primera",
  artist: "Artista",
};
const second = {
  source: "deezer",
  id: "song-2",
  title: "Segunda",
  artist: "Otro artista",
};

test("collects catalog songs from the blocks that were practised", () => {
  const songs = collectPracticedCatalogSongs(
    [
      { catalogSong: first },
      { catalogSong: second },
      { catalogSong: undefined },
    ],
    [120, 0, 300],
  );

  assert.deepEqual(songs, [first]);
  assert.notEqual(songs[0], first);
});

test("offers the same catalog song only once", () => {
  const songs = collectPracticedCatalogSongs(
    [{ catalogSong: first }, { catalogSong: { ...first } }],
    [60, 60],
  );

  assert.equal(songs.length, 1);
  assert.equal(getCatalogSongKey(songs[0]), "itunes:song-1");
});

test("a block without catalog song is ignored", () => {
  assert.deepEqual(collectPracticedCatalogSongs([{ name: "Técnica" }], [120]), []);
});
