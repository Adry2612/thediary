# tab-score-range-editing Specification

## Purpose
Lets the user mark a group of notes by dragging over the staff and turn those notes into irregular subdivisions such as triplets and quintuplets while the bar keeps its total length.

## Requirements

### Requirement: A group of notes can be marked by dragging

The system SHALL mark every beat covered by a drag and every note in those beats, SHALL draw the mark as one continuous block over the marked beats spanning the full height of the staff with a visible outline as well as a green fill, SHALL select a single note only when the press lands inside the drawn box of that note outside the current marked range without snapping to nearby notes, SHALL keep the marked range when the press lands inside it —including when the note menu opens—, SHALL place the cursor at the pressed point when the press lands on empty staff, SHALL keep Shift and vertical touch scrolling, and SHALL NOT write a note or open the note menu after a drag.

#### Scenario: Dragging over three notes
- **WHEN** the user presses on the first note and drags to the third note on the same string
- **THEN** the three beats are shown as one green block and every note in them is marked

#### Scenario: A horizontal drag over a phrase that changes strings
- **WHEN** the user drags from the first note to the third and the third note is on another string
- **THEN** all the notes in the marked beats are selected, whichever string they use

#### Scenario: Pressing near a note
- **WHEN** the user presses just outside the drawn box of a note
- **THEN** no single note is selected; the press sets the cursor at that point and a drag from there marks a range

#### Scenario: Pressing exactly on a note
- **WHEN** the user presses inside the drawn box of a note and no range is marked
- **THEN** only that note is selected

#### Scenario: Opening the note menu inside a range
- **WHEN** the user double-clicks, right-clicks or long-presses a note that is inside the marked range
- **THEN** the note menu opens and the range stays marked, so the range actions still apply to all its beats

#### Scenario: Dragging across strings
- **WHEN** the drag covers more than one string
- **THEN** the block still spans the full height of the marked beats and includes every note in them

#### Scenario: Empty beats
- **WHEN** the drag crosses a beat with no notes
- **THEN** the beat is still part of the green block but contributes no note

#### Scenario: A click still selects one beat
- **WHEN** the user presses and releases without moving past the drag threshold
- **THEN** only the beat under the pointer is selected

#### Scenario: Dragging across bars
- **WHEN** the drag ends on a later bar
- **THEN** the selection covers the beats between the start and the end, across the bar line

#### Scenario: Touch scrolling
- **WHEN** the user drags vertically over the staff on a touch screen
- **THEN** the page scrolls and no range is marked

#### Scenario: The drag does not open the note menu
- **WHEN** the user drags over a note and releases
- **THEN** the note menu does not open and no fret is written

#### Scenario: Shift still extends
- **WHEN** the user extends the selection with Shift + click or Shift + arrow keys
- **THEN** the range grows exactly as when dragging

### Requirement: A beat or a group of notes can be made into an irregular subdivision

The system SHALL offer subdivisions of 3, 5, 6, 7, 9, 10 and 12. A single marked beat SHALL be divided into that many slots of the same total, with its content in the first slot, the other slots empty, and the first slot selected. A selection of exactly N marked beats within one bar SHALL be grouped into one subdivision, with no beat added, removed or left outside the group; when the selected beats have different figures and the time freed cannot be written with the available figures, all N SHALL take the shortest of their figures so the freed time stays writable; the freed time SHALL be left as empty beats at the end of the bar, never as rests, and the beat after the group SHALL be selected so new notes are written outside it. The bar SHALL keep its total, and a selection with fewer or more than N beats SHALL be rejected with a reason.

#### Scenario: Dividing a quarter into a triplet
- **WHEN** the user selects a quarter rest and chooses the subdivision of 3
- **THEN** the beat becomes three triplet eighth-note slots that together last one quarter

#### Scenario: Writing the notes of the group
- **WHEN** the user chooses a subdivision and then types a fret for each slot
- **THEN** the cursor advances through the slots and the group is filled with the written notes

#### Scenario: Content stays in the first slot
- **WHEN** the user subdivides a beat that already has a note
- **THEN** the note stays in the first slot and the other slots are empty, with no rest figures

#### Scenario: The bar keeps adding up
- **WHEN** the user subdivides a beat in a bar that was complete
- **THEN** the bar is still complete and is not flagged

#### Scenario: Drawn and played with its number
- **WHEN** the tab is drawn and played
- **THEN** the subdivision is shown with its number and the playback uses its ratio

#### Scenario: Grouping three written notes
- **WHEN** the user selects exactly three eighth-note beats and chooses the subdivision of 3
- **THEN** those three notes form one triplet group —not three separate triplets—, the freed eighth is left empty at the end of the bar with no rest figure, and the beat after the group is selected

#### Scenario: Writing after a group
- **WHEN** the user groups three notes into a triplet and then types a fret
- **THEN** the note is written after the group, outside the subdivision, and the group keeps its three notes

#### Scenario: Grouping three quarters
- **WHEN** the user selects exactly three quarter-note beats and chooses the subdivision of 3
- **THEN** the three notes form one triplet group and the freed quarter is left as an empty beat

#### Scenario: More notes than the subdivision
- **WHEN** the user selects four beats and chooses the subdivision of 3
- **THEN** the action is disabled, no beat is grouped and the description asks for exactly three

#### Scenario: Fewer notes than the subdivision
- **WHEN** the user selects two beats and chooses the subdivision of 3
- **THEN** the action is disabled and the description asks for one beat or exactly three

#### Scenario: The freed time cannot be written
- **WHEN** the user selects three beats with different figures and the freed time cannot be written with the available figures
- **THEN** all three notes take the shortest of their figures, form one group and the freed time is still left as empty beats, with the bar keeping its total

#### Scenario: The group crosses a bar line
- **WHEN** the selection spans more than one bar
- **THEN** the action is disabled and the description says it must fit in one bar

#### Scenario: A beat that is already subdivided
- **WHEN** the selected beat already belongs to a subdivision
- **THEN** the subdivision actions are disabled and the description says it is already subdivided

#### Scenario: A beat that cannot be divided
- **WHEN** the beat is too short to fit the chosen division in whole ticks
- **THEN** that subdivision is disabled and the description explains why

#### Scenario: The beat limit
- **WHEN** dividing the selected beats would exceed 64 beats in a bar
- **THEN** the action is disabled and the description says the bar is full

#### Scenario: Rounding in sevens and nines
- **WHEN** the user chooses a subdivision of 7 or 9
- **THEN** the bar is not flagged for the few ticks lost to rounding

#### Scenario: Undo
- **WHEN** the user undoes a subdivision
- **THEN** the original beat comes back with its previous length and content in one step
