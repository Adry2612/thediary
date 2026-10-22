# Design

## Context

See `proposal.md` — Why. What shapes the approach beyond the motivation:

- The separation this change completes **already exists in the repo** and is load-bearing: `src/lib/*` is the only surface the test suite imports (`tests/*.test.mjs` import `src/lib/*`, `src/i18n/*`, `src/stores/*` — never `src/components/*`). Extraction therefore makes logic testable for free instead of inventing a new testing story.
- Current layering in practice: `src/types/*` (domain data, 2 files), `src/lib/*` (~35 flat modules + `cloud-sync/` + `supabase/` subfolders), `src/hooks/*` (14 hooks, all but two with `"use client"`), `src/stores/*` (zustand), `src/i18n/*`, `src/components/{ui,<domain>}/*`.
- 71 components; 56 start with `"use client"`. Primitives in `ui/` (`Button`, `Card`, `Block`, `Field`, `icons`) are directive-free so they stay importable from server components.
- Two tests assert component **source text** rather than behavior: `tests/cloud-sync-auto-sync-ui.test.mjs` reads `SettingsView.tsx` for the auto-sync `aria-pressed` wiring, `tests/cloud-sync-ui.test.mjs` reads `PracticeRecordingItem.tsx` for its `menu` roles.
- Selector/identity coupling that must survive any move: `data-tour-target` values (`brand`, `practice-plan`, `dashboard-summary`, `metronome-controls`, `settings-account`) queried by `TutorialProvider` and asserted in `tests/tutorial-steps.test.mjs`; `id="practice-day-tooltip"` referenced through `aria-describedby` by two calendars; `role="timer"`/`aria-live` on the timer; the `role="dialog"`/`aria-modal` contract in `SettingsView`'s inline `Modal`; `SelectField`'s `value.closest("dialog")` portal lookup.
- No new dependencies are available for this work (the package is deliberately small), so variants are hand-rolled props, not a styling library.

## Goals / Non-Goals

**Goals:**

- A single written rule for what a component file may contain, applied consistently, so the refactor has an acceptance test that is more than "it looks cleaner".
- One component per visual shape, with variants, where today there are 2–30 copies of that shape.
- Every extracted piece of logic lands in the layer that already exists for it, with the **dependency direction pointing one way only**: `types` ← `lib` ← `hooks` ← `components/ui` ← `components/<domain>` ← `app`.
- Each wave independently landable with `npm run typecheck` and `npm test` green, so the work stops cleanly at any point.

**Non-Goals:**

- No new dependencies, no ESLint/rule enforcement of the convention (documented here and in the task list only).
- No visual, structural-markup, copy, i18n or route changes. No accessibility contract changes.
- No deletion of dead code discovered during the survey.
- No prop-type consolidation beyond the stated rule; no barrel/index re-exports for `lib`/`ui`.

## Decisions

### D1. Define "visual only" as a rule, not a feeling

A component file may contain: the props interface it declares, `useI18nSection`/context hook reads, calls to its own hooks, JSX, and trivial prop-to-primitive wiring. It must **not** contain: multi-branch event handlers, async flows, validation, formatting, date/geometry math, module-level lookup maps/enums, `useEffect` bodies longer than a primitive binding, or `useState` clusters that act as a state machine.

Test of compliance, used as the review checklist: *could this function be called with `node --test` if it were exported?* If yes, it belongs in `lib`. *Does it need React state/refs/lifecycle?* If yes, it belongs in a hook.

*Alternatives:* an ESLint boundary rule (`eslint-plugin-boundaries`) would enforce it mechanically but adds a dependency and a lint setup the project doesn't have. Rejected; documented instead.

### D2. Layer ownership, chosen by what the code needs — not by size

| What the code needs | Goes to | Why not the other layer |
|---|---|---|
| No React, deterministic, testable | `src/lib/<domain>.ts` | Hooks import React; tests can't run hooks without a DOM |
| React state/refs/effects/lifecycle | `src/hooks/use<Thing>.ts` (`"use client"`) | `lib` must stay directive-free so tests and server code can import it |
| `"use client"` + `createContext`/provider | `src/hooks/` beside the existing `useMetronome` provider pattern | A provider is state, not presentation |
| Domain data shape (union, enum, kind, draft, context value) | `src/types/<area>.ts` | — |
| A component's own props | Stays in the component file | It is the component's public API; moving it separates a contract from its owner and adds a file hop per component. Only types **exported and consumed elsewhere** (e.g. `PracticeTooltipDay`) move out. |

The `types` ↔ `lib` split follows the existing evidence: `types/practice-attachment.ts` holds `ATTACHMENT_TYPES`/`AttachmentType`/`AttachmentDraft`, i.e. value-shaped domain data with no functions; `lib/select-options.ts` holds `SelectOption` **together with** `buildSelectEntries` because they change as a pair. Decision: **data-only types go to `types`; a type that only describes one function's arguments stays with that function in `lib`.**

### D3. Variants by explicit props, not by `className` escape hatches

Shared components take closed unions (`variant`, `size`, `tone`, `padding`, `as`) and keep a `className` pass-through for composition. Rationale: the duplicated markup exists *because* call sites each re-derived the class string; a permissive `className` alone would preserve the copying. Every variant must reproduce the exact class strings it replaces — a variant is only acceptable if a migrated call site renders byte-identical classes.

Pruning rule: a variant is added only when at least two call sites need it. Otherwise the call site keeps `className`.

*Alternatives:* `tailwind-variants`/`cva` (new dependency, and the primitives here are tiny); a data-attribute + CSS approach (Tailwind-only project, no CSS layer to hook into). Rejected.

### D4. One dialog primitive per mechanism, sharing the imperative bits

The repo has two legitimate mechanisms; the design keeps both and removes the *duplication inside* each:

- `ModalDialog` — wraps native `<dialog>`: owns `showModal()`/`close()` effects, body-scroll lock, `onCancel` prevent-default, and the `lg|md|confirm` size/shape variants. Native `<dialog>` is kept deliberately because `SelectField` portals into `value.closest("dialog")` and because `::backdrop` + focus containment come free.
- `PortalModal` — the `role="dialog"`/`aria-modal`/Escape/overlay-click shape currently private to `SettingsView`, promoted to `ui/` and reused by its two inner dialogs.
- `ConfirmDialog` and `DialogHeader` — purely presentational, built on the two above; `ConfirmDialog` removes the byte-identical "new practice" dialog duplicated between `ActivePracticeSessionHost` and `RepertoireItemCard`.

Decision: **do not unify the two mechanisms into one.** Porting `SettingsView`'s modal into native `<dialog>` would change focus/scroll behavior and risk the accessibility spec; the duplication being removed is the per-component reimplementation, not the two mechanisms.

### D5. Extract the shape first, adopt it in waves

Build and land the primitives (`SectionHeader`, card tones, `IconButton`, `ToggleChip`, `CheckboxField`, `Field`/`FormMessage`, `EmptyState`, `RemovableChip`, `Button` variants) **before** migrating call sites, and migrate in waves by domain. Rationale: building a primitive and migrating 8 call sites in one step makes a regression impossible to bisect and hides which call site changed a class.

Wave boundaries (also the task grouping):

1. Foundation — new `lib` helpers and hooks with no JSX impact (`errorMessage`, `practice-track-updates`, `practice-calendar`, `repertoire-tab`, `repertoire-item`/`-editing`, `manual-practice`, `format`, `practice-resources`, `account-validation`, `practice-data-state`, `tutorial-layout`, `difficulty-labels` move).
2. Shared UI — the primitives above; no call sites touched yet beyond the ones they already serve (`Button`, `Card`, `Block`).
3. Providers/controllers — `AppDataProvider`, `TutorialProvider` (logic out of the component, provider shell intact).
4. High-traffic domains — `SettingsView`, `RepertoireItemCard`, `RepertoireView`, `RepertoireSongForm`, `PracticeMaterials`, `MetronomeSettings`, `RecordingsLibrary`, `PracticeSession`, `PracticeWorkspace`, `TimerCard`, `YearPracticeCalendar`, `TabEditor`.
5. Adoption sweep — the remaining editors, dialogs, dashboard cards and list rows that now compose the primitives (including `PracticeRecordingItem`, whose menu roles are asserted by a test).

### D6. Keep provider shells and hydration order intact

`AppDataProvider` orchestrates `usePracticeStore.persist.rehydrate()` and namespace switching, and `TutorialProvider` owns the tour lifecycle; both are mounted in `src/app/layout.tsx` alongside `MetronomeProvider`. Decision: **extract only pure functions and standalone hooks out of them — do not split, reorder or re-mount providers**, because hydration order and the `CloudAutoSyncHost` mount asserted by `tests/cloud-sync-auto-sync-ui.test.mjs` are behavior.

### D7. Extracted logic stays i18n-agnostic

Pure functions in `lib` must not call `useI18nSection`. Where extracted logic produces text, it takes the section object or already-resolved strings as arguments, following the existing `getDifficultyLabel(text, difficulty)` pattern. The i18n migration of components with hardcoded Spanish is out of scope (proposal), and this rule keeps that door open without changing behavior now.

### D8. "use client" is a correctness constraint, not a style choice

New `ui` primitives are directive-free (composable from server components, like today's `Button`/`Card`/`Block`); new hooks carry `"use client"`. A primitive that needs interactivity must be split into a directive-free shell plus a client child rather than marked wholesale, so `npm run build` cannot start pulling client boundaries upward.

### D9. Verification strategy for a behavior-preserving refactor

Gates, in order, after every wave: (1) `npm run typecheck`; (2) `npm test`; (3) `npm run build` at wave boundaries (catches server/client boundary regressions that typecheck misses); (4) a manual pass over the screens each wave touched, with the specific interactive flows called out in the tasks (dialog open/close/Escape, metronome modal, timer dialogs, tutorial spotlight, cloud connect/disconnect, recordings library refresh, calendar tooltip, tab editor with `NEXT_PUBLIC_TAB_EDITOR` enabled).

New pure functions get `node --test` coverage where they replace untested behavior (`updateById`, `practice-calendar` date helpers, `buildRepertoireExtraConfigUpdates`, `errorMessage`, `account-validation`), because the extraction is exactly the moment the tests become possible. Coverage is added for extracted logic, never to compensate for a copy that was left behind.

The two source-text tests are treated as **tests of ARIA wiring, not of file location**: when their subject moves they are re-pointed to the new owner in the same commit, and their assertions are kept verbatim. If a re-point would require weakening an assertion, that is a signal the wiring changed and the migration is wrong, not the test.

## Risks / Trade-offs

- **Silent visual drift while consolidating variants** (a `variant` that renders a class string subtly different from the copy it replaces) → Migrate one call site per commit per primitive, and require byte-identical class parity; the gated checks above plus a manual pass over the touched screens. This is the main risk of the whole change.
- **The two source-text tests fail on extraction** → Re-point them in the same commit as the move; never delete or loosen their assertions.
- **Moving `data-tour-target`, `aria-describedby` ids, or `role` attributes off their current elements, breaking the tour or accessibility contracts** → Those attributes stay on the same rendered element after extraction; `tests/tutorial-steps.test.mjs` and the `app-accessibility` scenarios are the guard.
- **`SelectField`'s `closest("dialog")` portal lookup breaks if a dialog shell is restructured** → Keep native `<dialog>` as the direct ancestor of form fields (D4); verify the metronome settings dialog and the repertoire dialogs, which contain selects, as part of the manual pass.
- **Hook extraction introduces stale-closure / effect-ordering bugs** where logic used to close over component state → Keep refs, effect deps and cleanup inside the extracted hook verbatim; the flows with real timing (practice timer, metronome, tutorial spotlight, cloud sync polling) are explicit manual checkpoints.
- **Over-abstraction**: forcing a single component over shapes that only look alike → The two-call-site rule for new variants (D3) and the explicit "keep `className`" escape hatch; `PracticeMaterials`/`RepertoireItemCard` rows are deliberately *not* unified into one generic row.
- **Large, hard-to-review change** (~40 files) → Wave sequencing (D5) with each wave independently landable; stop after any wave and the tree is green.
- **`TabEditor` sits behind `NEXT_PUBLIC_TAB_EDITOR` and cannot be verified in a default run** → Verify with the flag enabled locally, and keep its early return placement untouched so the flag behavior is unchanged.
- **Provider/`"use client"` regressions** → D6 and D8, plus the `npm run build` gate at wave boundaries.
- **Scope creep into the i18n gaps the survey found** (hardcoded Spanish in several components) → Explicitly out of scope; touching them would change user-visible behavior under the English locale.

## Migration Plan

1. Land wave 1 (pure `lib` helpers + tests). No JSX changes; revert is trivial.
2. Land wave 2 (primitives) with `Button`/`Card`/`Block` extended in place, preserving current output exactly.
3. Land waves 3–5 per domain, each as its own step: extract logic → adopt primitives → delete the now-unused local copies, with `typecheck` + `test` green at every step and `build` + manual pass at each wave boundary.
4. No data migration, no deploy ordering, no feature flag introduced.
5. Rollback: revert the step (or wave). The change is source-only, so nothing persists or needs cleanup — with one caveat: a step that re-points a source-text test must be reverted together with the code it moved.

## Open Questions

- Whether the dark-theme card family (`border-zinc-800 bg-zinc-900`, ~15 sites) should eventually collapse into the same token set as the light `Card`, or stay an explicit alternate theme. Deferrable: this change captures it as a `tone` and does not touch colors.
- Whether the dead code the survey found (`PracticeHeatmap.tsx` imported nowhere, empty `src/lib/practice-stats.ts`, 5 shadowed filter constants in `RepertoireView.tsx`) should be removed. Deferrable: removal is a separate change so this one stays behavior-preserving.
