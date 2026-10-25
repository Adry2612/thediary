# Design

## Context

See `proposal.md` — Why. The constraints that shape the approach:

- The creation modal is a single column: `RepertoireItemDialog` renders `ModalDialog`, and before this change the only way into the catalog was a magnifier icon beside the title. That icon is `IconButton` + `SearchIcon`, with no visible label, and the catalog's answer lives in a second modal.
- The form's identity fields are four short inputs and a resource editor; the chord chart and the tab are long editors below them. Searching for a song is a separate job and deserves its own surface.
- The app already mounts dialogs on demand (`RepertoireItemDialog`, `ConfirmDialog`) and nests one inside another (`ChordFinderDialog`), so the lookup can be a modal inside the creation modal without new primitives.
- `useCatalogSearch` exposes `status | results | search(query)`, cancels the in-flight request and reports `empty` and `unavailable` separately. `useRepertoireSongDraft.applyCatalogCandidate` is the only writer of catalog fields on the creation form.
- `mergeCandidates` in `src/utils/catalog-results.ts` is the whole ranking: it scores each candidate by token overlap and exact/startsWith title match, then sorts by score, then by newest release year, then by arrival index. `duplicateKey` is `title|artist|album`.
- Observed upstream order (iTunes, `entity=song`, `country=ES`) puts the canonical recording first for every query sampled: "master of puppets" → Metallica, "hurt" → Johnny Cash, "corazon partio" → Alejandro Sanz, "wonderwall" → Oasis, "la flaca" → Jarabe de Palo, "stairway to heaven" → Led Zeppelin. The app's own answer for "master of puppets" is Steve 'n' Seagulls, Van Canto, Rockabye Baby! and only then Metallica, entirely because of the year tie-break.
- Layer direction (`types ← utils ← services ← hooks ← components ← app`) is enforced by `tests/architecture-layers.test.mjs`; the search state belongs in a hook, the dialog in `components/repertoire`.

## Goals / Non-Goals

**Goals:**

- One obvious, labelled entry point into the catalog from the creation form.
- A modal with room for the query and five candidates, where the results follow the typing instead of a submit.
- Make the first row the version the user most likely meant, using the ranking the provider already computed.
- Keep the two failure modes (`empty`, `unavailable`) and the "never blocks manual creation" contract untouched.

**Non-Goals:**

- Popularity ranking, play counts, or any extra request to obtain them.
- Recent searches, suggestions or persisted state between openings.
- Collapsing edition variants beyond exact normalized title + artist.
- Any change to the route, the providers, the cache or the item schema.

## Decisions

### D1 — The provider's order is the ranking

`mergeCandidates` becomes a concatenation plus a stable de-duplication: take the primary results, append the fallback results, keep the first occurrence of each key, slice to the limit. The relevance score, the accent-aware token matching used only for scoring, and the year tie-break are deleted.

Why: the providers already rank by their own popularity and relevance signals, and that ranking matches the user's expectation in every query sampled. Our score cannot beat it, because an exact title match gives a novelty cover the same score as the original; only the provider knows which one people actually play.

Alternatives rejected:

- **Keep the score, tie-break by provider position.** The score still promotes a cover above the original when the query is the bare title, which is exactly the reported case. No benefit over provider order.
- **Use Deezer's `rank` field as a popularity signal.** It is a real signal, but it only exists when Deezer answered, and today Deezer is only called when iTunes fails or returns nothing. Always calling both would double the outbound requests and the latency for a gain the primary order already provides.
- **Penalize "live", "remaster" or "cover" in the title.** A word list to maintain, and it would demote a version the user may specifically want.

### D2 — Duplicates collapse on title and artist, not album

`duplicateKey` drops the album and keeps the accent-, case- and whitespace-insensitive title plus artist. The first occurrence wins, and because the provider puts the canonical release first, that is the one kept.

Why: "master of puppets" returns the same Metallica recording three times (Deluxe Box Set, Remastered, Stranger Things soundtrack). All three are the same song for this app, and together they consume three of the five rows.

Alternatives rejected:

- **Keep the album in the key** (today): the duplicate flood above.
- **Also strip trailing parentheticals**, so `Master of Puppets (Live)` collapses into `Master of Puppets`. This would tidy the list further, but it can merge genuinely distinct songs whose title ends in parentheses, and the live version already lands after the studio one. Left for a later change if it proves noisy in use.

### D3 — A text button opens the lookup

The creation form gets a `Button variant="ghost"` labelled `catalogSearchTitle` ("Buscar en el catálogo") with a decorative `SearchIcon`, above the fields, followed by the existing one-line hint in muted text. It replaces the unlabelled magnifier: the action now says what it does, and the icon is decoration rather than the only affordance.

Why not keep the icon beside the title: an icon-only trigger next to a `required` text field is the smallest target in the form and the least self-explanatory. Why not put the button inside the title row: it would compete with the field for width and read as part of the input.

### D4 — The search runs while typing, with a short pause

Inside the dialog, `query` is state and a `useEffect` watches it:

- Fewer than `MIN_CATALOG_QUERY_LENGTH` (2) characters: the hook's `reset()` clears results and status, so a half-typed letter never shows stale candidates.
- Otherwise the effect schedules `search(query)` 350 ms after the last change and cancels the previous timer. `useCatalogSearch` also aborts the previous request, so only the newest one can land.
- Enter calls `searchNow()`, which clears the pending timer and searches immediately, so keyboard users are not forced to wait 350 ms.
- Changing the query back to something already searched does not re-fire, because the effect compares against the last query it searched.

The hook keeps the previous results on screen while a new search is in flight (`status = "loading"`), so the list does not blink between keystrokes.

Alternatives rejected:

- **Search on every keystroke.** One request per letter, most of them already obsolete, and the API is a server proxy with a timeout.
- **Keep the explicit submit.** It is the state being replaced: the user asked for results that follow the typing.
- **Debounce in the hook.** The hook is shared with other callers and should stay a transport concern; the pause is a property of this input.

### D5 — The dialog owns the state; the form only triggers and receives

`CatalogSearchDialog` receives an optional `initialQuery`, `onSelect(candidate)` and `onClose`, and holds the query, the debounce and the `useCatalogSearch` instance. It is mounted only while open, so closing discards the search and aborts the request. `RepertoireSongForm` owns a boolean and wires `onSelect={applyCatalogCandidate}`; `RepertoireItemCard` wires the same `applyCatalogCandidate`, which still applies the fill-only-empty rule. Neither draft hook nor the store changes.

`CatalogSearchPanel` is deleted: with both entry points opening the same dialog there is only one shell left, and a component that only forwards props to its single parent earns nothing.

### D6 — Search on open only when there is something to search

A saved song opens the dialog with `buildCatalogQuery(title, artist)` already typed, so "Buscar datos" is one action. The creation form passes the same builder with whatever is already in the title and artist fields; when those are empty the dialog opens with an empty query, the input focused, and no request until the user types. The mount search is immediate; only the reactive search waits.

### D7 — Layout

The form is unchanged apart from the trigger: button, hint, then the fields grid — title and artist full width, album `2fr` and year `1fr` — and study material under them. The chord chart, the tab and the save action keep the full width.

The creation dialog keeps the `wide` variant (`max-w-3xl`) added in this change: the form holds two long editors and the extra room keeps their lines readable. The lookup dialog stays at `lg` (512 px), where a five-row list of 56 px covers, title, artist and album·year fits without scrolling on a 677 px-tall viewport.

## Risks / Trade-offs

- **[The provider's order is wrong for some query]** → The user still gets five candidates and can type the artist to narrow it; this is no worse than the current behaviour, which reorders even good answers.
- **[Collapsing by title + artist hides the edition the user wanted]** → The kept row is the provider's best match for the typed title, and album, year and artwork remain editable by hand on the item.
- **[Search-as-you-type fires requests the user did not ask for]** → Only from two characters on, one per pause, the previous request is aborted, the server caches identical queries for 15 minutes, and typing the title in the form still fires nothing because the dialog is not mounted.
- **[A 350 ms pause feels laggy on a fast connection]** → It is measured from the last keystroke, not from the first; Enter short-circuits it, and the previous results stay on screen while the next arrive.
- **[Enter and the debounce could double-fire]** → `searchNow()` clears the pending timer, and the effect compares against the last searched query.
- **[The button adds a row of chrome above the fields]** → One 48 px button and a one-line hint, instead of a query field, a submit button, a status line and a result list.

## Migration Plan

Pure UI and pure-function change: no storage migration, no API change, no new dependency. Deploy is a normal build; rollback is reverting the commit, and items saved with catalog metadata stay valid either way.

## Open Questions

None.
