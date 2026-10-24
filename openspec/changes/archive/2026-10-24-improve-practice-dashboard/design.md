# Design

## Context

See `proposal.md` for motivation and `specs/practice-dashboard/spec.md` plus `specs/practice-session-management/spec.md` for the behavior contract.

The dashboard is a client view built from a single `history: SessionRecord[]` stored in the zustand practice store and mirrored in the per-user JSON state. Charts are hand-written SVG/CSS (`PracticeTimeChart`, `SkillBalance`) with no chart dependency. Pure analytics live in `src/utils/practice-analytics.ts` and are tested with `node --test`; components follow the layering in `docs/component-conventions.md` (`types ← utils ← services ← hooks ← components/ui ← components/<domain> ← app`).

`SessionRecord` already stores one session-wide `averageBpm` sampled from the metronome, and `SessionPhaseRecord` stores elapsed seconds per block but no tempo. `GuitarType` exists only on repertoire items. The analytics module keeps its own four-item skill list, so `lick` time is currently missing from the skill distribution and from the most-practiced metric.

The day summary is rendered through a portal with `position: fixed`, coordinates calculated once on hover and `pointer-events: none`. That combination explains both reported bugs: the summary cannot be entered and it does not follow or dismiss on page scroll.

## Goals / Non-Goals

**Goals:**

- Make the day summary genuinely interactive without converting it into a modal or a click-driven popover.
- Keep every new metric deterministic and testable outside React.
- Compare tempo improvements without mixing different material or over-weighting tiny samples.
- Add guitar-type analysis without inventing classifications or requiring a database migration.
- Preserve the existing visual language, i18n pattern and accessibility level.

**Non-Goals:**

- Redesigning the day summary content, which is deferred to a later change.
- Adding chart libraries, animation frameworks or a global period selector.
- Backfilling history with guitar types, per-block BPM or missing phase names.
- Making the tempo card a scientific measurement of playing ability; it remains a practice-metronome indicator.

## Decisions

### 1. The day summary becomes an interactive hover card controlled by a hook

`usePracticeDayTooltip` keeps the hovered day plus a close timer and a ref to the summary card. The trigger calls `show` on enter/focus and `scheduleHide` on leave/blur. The card calls `cancelHide` on pointer enter and `scheduleHide` on pointer leave. The grace period (~150 ms) lets the pointer cross the 10 px gap between the day and the card.

While a summary is open, the hook listens for:

- **Page scroll** (`window` capture): closes immediately unless the event target is inside the card. This dismisses stale fixed coordinates and still allows scrolling the card's internal session list, whose scroll events are filtered by the card ref.
- **Resize**: closes, because the anchored coordinates are no longer valid.
- **Escape**: closes.
- **Pointer leaving both trigger and card**: closes after the grace period.

`PracticeDayTooltip` stops being `pointer-events-none` and receives the enter/leave handlers. It stays a `role="tooltip"` because its current content is read-only text; if it later gains focusable controls, it must become a non-modal dialog. The portal and positioning helper stay; `getPracticeTooltipPosition` keeps the gap and viewport clamping.

Alternatives considered:

- **Reposition on scroll instead of closing**: keeps the card attached but makes it chase the pointer while scrolling and still requires cancel-on-scroll for the card's own list. Closing is simpler and matches the user's complaint.
- **Click-to-open popover**: would solve hover but changes the established interaction and adds a second dismissal path; not requested.

### 2. Skill balance reads a distribution, not raw totals

`getSkillDistribution` gains a `sessionCount` per category, and `SkillBalance` receives the `SkillDistribution` instead of recomputing percentages from a `SkillTotals` map. A session counts for a skill when its `skillSeconds` for that skill is greater than zero. Using one source for minutes, percentages and session counts avoids rounding drift between the chart and its summary.

The component becomes a small client view with `activeSkill` state: hovering an arc or a legend row, or focusing a row, swaps the donut centre from the monthly total to that skill's minutes, percentage and session count. Pointer leaving the card restores the total. The legend rows become the keyboard controls; arcs stay pointer-only because the legend already exposes the same information.

Alternatives considered:

- **Keep totals and add a separate counts map**: duplicates percentage logic and invites divergence.
- **Portal tooltip for each skill**: unnecessary inside a card whose summary can live in the existing centre space.

### 3. The skill catalogue is shared from `types/practice.ts`

`practice-analytics.ts` imports the `PRACTICE_SKILLS` constant instead of keeping a local four-item array. The same fix applies to `manual-practice.ts`, whose local list rejects `lick`. This removes the current drift and makes the dashboard count every category.

Consequence: existing percentages can change when lick time exists, and the most-practiced metric can now report lick. This is a correctness fix, not a regression; tests with lick data must assert the new behavior.

### 4. Guitar type is a session field with an optional choice and a local default

`SessionRecord` gains `guitarType?: GuitarType`. `ActivePracticeSession` carries the same optional field so the choice survives reloads of the running practice. The selector (electric/acoustic/unset) is shown in the running practice header, the manual practice form and the session editor. The saved record receives the value through `createPracticeSessionRecord`, `createManualPracticeRecord` and `applySessionEdit`.

A small preference hook remembers the last chosen type in local storage and pre-fills new practices; the user can always clear it. The type is never inferred from the linked song, because a song can be practised on either instrument and the spec forbids inventing classifications.

Normalization (`normalizeSessionRecord`) keeps only `"electric"` or `"acoustic"` and drops anything else without losing the session. Both the local hydration path and the cloud merge path already call this normalizer, so no extra plumbing is required.

Alternatives considered:

- **Per-block guitar type**: more precise when a session mixes instruments, but adds a field per block and a decision per block; the user chose per session.
- **Global profile setting**: fewer taps, but wrong as soon as the user changes instrument without changing the profile.
- **Infer from repertoire song**: leaves technique and theory unclassified and can be wrong.

### 5. Per-block BPM is derived at save time from the existing samples

The timer already records a session timeline of `{ elapsedSeconds, bpm }` samples and the result stores elapsed seconds per block. A new pure helper in `metronome-bpm.ts` splits that timeline at the cumulative block boundaries and computes a time-weighted average for each block, reusing the same weighting rule as the session average. `SessionPhaseRecord` gains `averageBpm?: number`; `createPracticeSessionRecord` receives the samples and writes a value only when the block had metronome time.

No timer change is needed: block elapsed totals already exist when the session completes. The value is rounded to an integer and considered absent when it is zero.

Editing preserves the stored per-block BPM: `EditableSessionBlock` carries the optional value and `applySessionEdit` writes it back for existing blocks. New blocks have none. Manual practices have none because no metronome data exists. Legacy sessions have no per-block values.

Alternatives considered:

- **Keep only the session average**: cannot attribute tempo to a song or technique when a session has several blocks, which is exactly the comparison the user wants.
- **Store the full sample timeline per block**: more precise but grows the stored JSON and is unnecessary for an average-based card.

### 6. Tempo progress compares contents over rolling windows

The card uses two rolling windows: last 7 days versus the previous 7, and last 30 days versus the previous 30. Rolling windows avoid comparing a partial calendar month with a complete one.

For each block with an average BPM, the content key is:

- `song:<itemId>` for a repertoire block, plus the part when one is stored (`song:<itemId>:part:<partId>`), because parts can have different tempos.
- `lick:<lickId>` for a linked lick.
- `<skill>:<normalized name>` otherwise, where normalization trims, lowercases and removes accents, so "Escalas" and "escalas" count as one technique or theory topic.

For every content present in both windows with at least one session and at least five minutes of practice time in each, the card computes a **recent level**: the time-weighted mean of up to the three most recent sessions in that window, weighted by the block's elapsed seconds. Comparing recent levels answers "where am I now?" instead of diluting improvement with the first slow sessions of the window.

The aggregate is weighted by current-window practice time:

- `deltaBpm = round(Σ(levelNow − levelBefore) × weightNow / ΣweightNow)`.
- `deltaPercent` is computed from the weighted aggregate levels (`(ΣlevelNow×w − ΣlevelBefore×w) / ΣlevelBefore×w`), not by averaging per-content percentages. Averaging percentages would over-weight slow tempos.
- The card shows the number of compared contents, marks one or two as a small sample, and lists up to two positive and two negative movers by absolute BPM change.

Legacy fallback: a session with a single block and a session `averageBpm` uses that average for the block; a legacy multi-block session is excluded because its average cannot be attributed. Sessions without metronome data are always excluded, and the card states that it uses practices with the metronome.

Alternatives considered:

- **Global average BPM per period**: simple but compares different material and mix changes; rejected by the user and by this design.
- **Whole-window mean per content**: stable but hides recent improvement; the recent-level variant is closer to the user's 80 → 82 example.
- **Unweighted average of per-content deltas**: over-weights contents practised for a few minutes; rejected.
- **Average of percentages**: over-weights slow tempos; percentage is derived from aggregate levels instead.

### 7. Content rankings use the full history and survive deleted items

`getPracticeContentRankings(history, repertoireItems)` walks every phase with elapsed time, groups songs by `repertoireItemId` (resolving the current title and part when available), licks by `lickId`, techniques and theory by normalized block name, counts distinct sessions, and returns the top three per ranking. A deleted song or lick falls back to the block name stored with the practice, so its time is not lost.

The card is labelled as full history because the skill and guitar cards are monthly; mixing periods silently would make the numbers incomparable.

### 8. The schedule uses the session start

`getPracticeSchedule(history)` assigns each session's full duration to the weekday and to the time band of its local `startedAt`:

- Night: 00:00–05:59
- Morning: 06:00–11:59
- Afternoon: 12:00–17:59
- Evening: 18:00–23:59

Assigning by start is a deliberate simplification: a session crossing midnight or a band boundary belongs to where it began, which matches how users remember a practice. The card shows seven weekday bars, four band bars and the peak weekday/band.

### 9. New views are small domain components

- `GuitarBalance`: hand-written semicircular SVG, two arcs plus an unclassified note and a legend; empty state when no classified time exists.
- `TopPracticeContent`: three ranked columns with text values and proportional bars.
- `PracticeSchedule`: weekday and band bars with a peak summary.
- `TempoProgress`: period toggle, big delta, comparison caption, small-sample note and movers list.

`DashboardView` computes the month-bounded balances and the full-history rankings with `useMemo`, and the two interactive cards own their local period/hover state. Layout: the existing time-chart/skill row stays; guitar balance and tempo progress share a `lg:grid-cols-3` row; most-practiced content is full width; schedule sits before the metric grid. All charts keep the existing dark palette, typography and `enter` animation.

### 10. Empty and unknown data is explicit

Every new card has a defined empty state and a caption for its period. Guitar balance reports unclassified time separately. Tempo progress distinguishes "no comparable contents" from "no metronome data". Rankings show empty states per column. Charts expose text values next to colour so colour is never the only signal.

## Risks / Trade-offs

- **BPM is a metronome indicator, not measured playing ability** → The card says it uses sessions with the metronome, compares only like-for-like content, and shows the number of contents compared and the main movers.
- **Small or unbalanced samples can produce a dramatic percentage** → Minimum five minutes per content per window, time weighting, small-sample label and movers list make the result interpretable.
- **Recent-level comparison can be noisy with one session per window** → It is still shown, but marked as a small sample; no value is invented when the same content is missing from one window.
- **Legacy sessions cannot feed per-content tempo** → The card relies on new per-block values; single-block legacy sessions remain usable, multi-block ones are excluded and this is stated instead of guessed.
- **Per-block BPM doubles the tempo data in saved sessions** → Only one integer per block; the stored JSON grows negligibly compared with resources and notes.
- **Hover-card gap can still flicker with very fast pointer movement** → Grace period plus a 10 px gap; the card is rendered only while a day is active, so it cannot accumulate stale overlays.
- **Scroll dismissal may surprise a user reading a long summary** → Dismissal only applies to page/viewport scroll; the summary's own list scroll is exempt, and Escape remains available.
- **Fixing the skill catalogue changes historical percentages** → This is the intended correction; tests must cover lick time and the metric explanation remains monthly.
- **Card periods differ (month vs full history vs rolling window)** → Each card states its period explicitly; a shared period selector is deliberately left for a later change.

## Migration Plan

- Deploy code only; there is no database migration.
- New optional fields (`SessionRecord.guitarType`, `SessionPhaseRecord.averageBpm`) are ignored by older clients and normalized on load by both local hydration and cloud merge.
- No backfill: old sessions stay unclassified and without per-block BPM.
- Rollback is safe: removing the new fields or cards leaves existing stored JSON readable, and normalization only drops invalid values.
- Verify with `npm test` (analytics, session record, editing, manual practice, tooltip, i18n), `npm run typecheck` and `npm run build`; manually check the hover card with page scroll, internal list scroll, keyboard and Escape.
