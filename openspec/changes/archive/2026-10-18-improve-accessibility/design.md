# Design

## Context

See `proposal.md` for motivation and `specs/app-accessibility/spec.md` for the required behavior.

Current state that shapes the approach:

- `src/app/globals.css` defines `--color-muted: #8a8884` as the app's secondary text tone, and the screens of the repertoire, the practice and the metronome use it (`text-muted`).
- The start and the dashboard are a cool-gray island built on Tailwind's `zinc` scale: `bg-zinc-900`/`950`, `border-zinc-800`, `text-zinc-100` for values and `text-zinc-400` for labels; 57 of their lines paint captions and meta with `text-zinc-500` and three with `text-zinc-600`.
- `SelectField` (`src/components/ui/SelectField.tsx`) builds its accessible name from the `ariaLabel` prop while its trigger shows the label of the selected option, and it is used both inside the field's `<label>` and as a stand-alone filter.
- `MetronomeCard` labels the dot of each beat with an `aria-label` on a `<span>` that has no role.
- `MetronomeCard` titles itself with an `<h3>` and is rendered by `/metronome`, whose title is an `<h1>`, and by `PracticeSession`, whose own section is an `<h2>`.
- `YearPracticeCalendar` (`src/components/dashboard/YearPracticeCalendar.tsx`) paints each day as a `size-4` button —16 px— in a grid of 7 rows with `gap-1`, over a `repeat(weekCount, 16px)` track, and scrolls to the latest practice assuming a column of `16 + 4`.
- `src/components/dashboard/PracticeHeatmap.tsx` repeats that same 16 px day cell, but no module imports it; the audit never reaches it.
- `AdjustableNumber` (`src/components/ui/AdjustableNumber.tsx`) paints the value and the unit side by side (`60 min`) and names its button `ariaLabel: value. Pulsa para editar…`, so the unit never reaches the name.
- `WeeklyPracticeSummary` (`src/components/dashboard/WeeklyPracticeSummary.tsx`) paints the weekday, the day of the month and `count` with `dashboard.session.slice(0, 3)` followed by a dot (`0 ses.`), while its `aria-label` spells the whole word (`0 sesiones`) and drops nothing else.

## Goals / Non-Goals

**Goals:**

- Every secondary text of the app meets the AA contrast, measured against the surface it actually sits on.
- The app's select can be named by the text it shows.
- No label on an element that cannot carry one.
- Every control that names itself carries in its name the text it shows, in the same order.
- Every day of the year calendar can be pointed at without a surgeon's aim.
- The headings of each screen descend without skipping a level.

**Non-Goals:**

- Reworking the tokens or unifying the start and the dashboard with the warm palette: the fix is the tone of that text, not the identity of those screens.
- The placeholder tone of the inputs and the tone of disabled options.
- Growing the square of a day of the calendar, or making the calendar denser or airier than it is: what grows is the area that answers to the pointer.
- Anything else the audit reported under performance.

## Decisions

### 1. The failing secondary text moves to the app's muted tone

`text-zinc-500` and `text-zinc-600` become `text-muted` (`#8a8884`) in the affected components. Measured with the WCAG formula, the token reaches 5.30:1 on the canvas, 5.01:1 on `zinc-900`, 5.62:1 on `zinc-950` and 4.60:1 on the hover fill those cards use, so it passes everywhere it appears today; the failing pairs it replaces (`zinc-500` over `zinc-900` at 3.67:1, `zinc-600` over the canvas at 2.42:1) match the numbers the audit reported.

Alternatives considered:

- Jumping to `text-zinc-400` (`#a1a1aa`, 6.9:1): rejected. It is the tone those same cards already use for their field labels, so the label and the description of a card would end up looking the same and the cards would lose a level; it is also a bigger visual jump than the muted tone.
- Inventing an intermediate gray (a "zinc-450"): rejected. The app already has a tone for secondary text, and adding a second one for a corner of the interface is worse than the small warm shift the token brings to those screens.
- Curiously, it is the audit itself that makes these numbers trustworthy: the same formula reproduces exactly the 3.67:1 the tool reported for the failing pair.

Risk worth writing down: the token would give only 4.21:1 over a solid `zinc-800`, so it must not be used as the text tone of a control whose background is that. Today no muted text sits on one: the `zinc-800` fills are hover states of controls painted with `zinc-200`/`zinc-300`, or decorative bars.

### 2. The select's accessible name carries the field and the value

`SelectField` composes its name as `field: value` when it has one, keeping the field's name alone when nothing is selected.

Alternatives considered:

- Removing `aria-label` and letting the visible text name the control: rejected. The name would become the value alone ("All states"), losing the field ("Progress") that tells the user what they are choosing.
- Wiring `aria-labelledby` from each visible label to the control: rejected for this change. It is the more precise pattern, but it needs every call site to hand over an id, and the composed name fixes the rule for all of them from one place.

### 3. The beat of the metronome keeps its label and gains a role

The dot becomes `role="img"`, the smallest role that accepts a name, so the beat and whether it is the active one are still announced.

Alternatives considered:

- Dropping the label and hiding the dot: rejected, it would throw away the only announcement of which beat is sounding.
- Labeling the wrapper of the beat: rejected, the wrapper is as generic as the dot and would fail the same rule.

### 4. The day of the calendar grows its target, not its square

The day button becomes a 24×24 target (`size-6`) and the intensity fill moves to an inner 16 px square, so the square keeps the size it has today. The grid drops its `gap-1` and its track goes from 16 to 24 px, which leaves the squares 8 px apart instead of 4 and makes the targets touch edge to edge. The scroll that follows the latest practice moves its column from `16 + 4` to 24 px.

Alternatives considered:

- Growing the square to 24 px: rejected. It is the shortest diff, but it redesigns the calendar —a year becomes 40% wider and the squares turn chunky— when what the rule asks is a reachable target, not a bigger mark.
- Keeping the 16 px square and widening only the gap to 8 px: rejected. It trusts the spacing exception of the rule (round the 16 px square, 24 px from centre to centre) over the size the rule states first; the audit reports the size as the main reason and the spacing as an aside, so the guarantee is weaker for the same layout cost.
- Expanding the hit area with `after:-inset-1`: rejected. It leaves the element's own box at 16 px, and it is the box, not the pseudo-element, that the audit measures.

### 5. The card of the metronome titles itself with a level-2 heading

The `<h3>` of `MetronomeCard` becomes an `<h2>`. The two screens that render it are `/metronome`, whose title is an `<h1>`, and `PracticeSession`, which already titles its panels with an `<h2>`, so the level that follows the surrounding title is 2 in both.

Alternatives considered:

- Removing the title: rejected, it names the panel.
- Demoting it to a `<p>`: rejected, it is a panel title in a screen with other panels.

### 6. The visible text and the accessible name are built from the same words

The unit joins the value in the name of `AdjustableNumber` (`ariaLabel: value unit. Pulsa para editar…`), and the day cell of `WeeklyPracticeSummary` composes its name from the weekday, the day of the month and the abbreviation it paints, so both names carry the text of their control.

The two controls then get the separators their tree was missing. The value and its unit, and the three pieces of the day cell, are sibling elements with nothing between them: what separates them on screen is the `gap` of the flex layout, and a gap is not a character. The audit reads the painted text by concatenating the text nodes of the subtree, so it sees `60min` and `L120 ses.`, and no name a screen reader could announce contains those strings. The repair is a text node holding a single space between the pieces; a text run that is only whitespace is not rendered as a flex item, so the layout does not move, but the tree keeps it and both the painted text and any name built from the content gain the separators.

Alternatives considered:

- Filling the names with the run-together text (`L120 ses.`): rejected, it makes the name worse for a person to settle a disagreement between what the control paints and what its tree holds.
- Taking `aria-label` away so the rule no longer inspects the control, with the extra information in a visually hidden span: rejected. It silences the rule instead of settling the disagreement —a name built from the content has no separators either—, and it would need hidden text at every call site.
- Spelling the whole word in the name ("0 sesiones"): rejected, it is the mismatch the audit reports, since the visible text keeps the abbreviation.

## Risks / Trade-offs

- [The muted tone is slightly warmer than the zinc around it] → Both are almost neutral (a difference of about six units in the blue channel), so it does not read as a mismatch; and the alternative loses the internal hierarchy of the cards.
- [The composed name changes what a screen reader announces for every select of the app] → It now announces the field and the value, which is more useful than the field alone.
- [The days of the calendar end up 8 px apart instead of 4] → The squares keep their size and the calendar scrolls horizontally already, so the year only grows a fifth in width; in exchange every day becomes reachable, which is what the audit asks for.

## Migration Plan

No data migration: class names, one heading level, the spacing of the calendar and some accessible names change. Rollback is reverting the commit.
