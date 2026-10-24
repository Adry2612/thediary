# Tasks

## 1. Guitar type in plans and templates

- [x] 1.1 Add the optional `guitarType` to `PracticeTemplate` and `PracticeLaunchPlan`, and copy it in `createTemplatePlan` and `createPracticePlanFromSession`; add tests that a template and a repeated session keep their type and that plans without one stay unchanged. Verify with `node --test tests/practice-launch.test.mjs` and `npx tsc --noEmit`.
- [x] 1.2 Add the guitar-type select to `PracticePlanBuilder`, default new plans to the last-used type, load and save it with templates, extend `onStart`, and carry `guitarType` through `PracticeWorkspace` (`draftPlan`, requested launches, quick/template starts). Verify with `npx tsc --noEmit`.
- [x] 1.3 Remove the guitar-type control and its props from `TimerCard`, remove `changeGuitarType` from `PracticeSession` while keeping the last-used seeding effect, and show the active session's type read-only in the plan header. Verify with `npx tsc --noEmit` and `grep -rn "onChangeGuitarType" src`.
- [x] 1.4 Verify in the browser: choose a type in a new plan, save the template, reopen it and confirm the type returns; start it and confirm the header shows the type while the timer has no selector; finish and repeat the session to confirm the type survives; clear the type in «Editar práctica» and confirm it is removed; confirm the manual-entry dialog still offers the choice.

## 2. Dashboard card sizes and copy

- [x] 2.1 Pair `PracticeTimeChart` and `PracticeSchedule` in one `lg:grid-cols-2` row with stretched items, move `SkillBalance` and `GuitarBalance` into an equal pair, and make `TempoProgress` full width; give `PracticeSchedule` a full-height flex surface. Verify with `npx tsc --noEmit`.
- [x] 2.2 Change the rhythm eyebrow to «Evolución del tiempo» / "Time evolution" and add a schedule subtitle that names the weekly and time-band pattern, keeping the existing period descriptions and full-history eyebrow. Verify with `node --test tests/i18n.test.mjs`.
- [x] 2.3 Verify in the browser at 320, 768 and 1280 px that the two time cards share width and height at wide sizes, stack full-width without overflow at narrow sizes, keep their original charts and values, and that their copy reads as volume versus pattern.

## 3. Most practiced artists in the repertoire

- [x] 3.1 Add `getArtistPracticeStats(history, repertoireItems)` to `src/utils/repertoire-analytics.ts`, grouping completed linked-song time by trimmed, case-insensitive artist, keeping the practised song count, and sorting by time then name; add tests for aggregation, variants, exclusions, ties and counts. Verify with `node --test tests/repertoire-analytics.test.mjs`.
- [x] 3.2 Add `ArtistRanking.tsx` with up to five rows showing artist, bar, time and practised-song count; add its Spanish and English keys; render it beside the forgotten widget when both exist and full width otherwise, hidden when empty. Verify with `npx tsc --noEmit` and `node --test tests/i18n.test.mjs`.
- [x] 3.3 Verify in the browser with seeded artists: the order matches practised time, two songs by one artist appear as one row, songs without artist and licks are absent, more than five artists are capped, the card hides when no artist has time, and the layout works at 320, 768 and 1280 px.

## 4. Integration verification

- [x] 4.1 Run `npm test` and confirm zero failures, including the launch, analytics and i18n tests.
- [x] 4.2 Run `npx tsc --noEmit` and `npm run build`, and confirm both succeed.
- [x] 4.3 Run `openspec validate refine-practice-plans-and-insights --strict` and confirm the change is valid.
- [x] 4.4 Do a final browser pass at 320, 768 and 1280 px: plan/template type flow, timer without the control, dashboard pair and copy, artist ranking, and no horizontal overflow.

## Workflow follow-up

- Archive `improve-practice-dashboard` and `refine-practice-dashboard` before this change, because this delta extends the pending `practice-dashboard` capability and assumes their base specification.
- Archive this change after implementation review.
