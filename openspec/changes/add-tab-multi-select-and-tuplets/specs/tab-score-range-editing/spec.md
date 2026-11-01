# Spec Delta

## Purpose

Lets the user mark a range of beats by dragging over the staff and divide the selected beats into irregular subdivisions such as triplets and quintuplets while the bar keeps its total length.

## ADDED Requirements

### Requirement: A range of beats can be marked by dragging

The system SHALL mark a range of consecutive beats when the user presses over the staff and drags horizontally with a mouse or a finger, SHALL highlight the range while dragging, SHALL keep Shift + click and Shift + arrows as alternatives, SHALL keep vertical scrolling on touch, and SHALL NOT write a note or open the note menu after a drag.

#### Scenario: Dragging across the staff
- **WHEN** the user presses on the first beat and drags horizontally to the third beat
- **THEN** the three beats are marked as the selection and shown highlighted

#### Scenario: A click still selects one beat
- **WHEN** the user presses and releases without moving past the drag threshold
- **THEN** only the beat under the pointer is selected

#### Scenario: Dragging across bars
- **WHEN** the drag ends on a later bar
- **THEN** the selection covers every beat between the start and the end, across the bar line

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

The system SHALL offer subdivisions of 3, 5, 6, 7, 9, 10 and 12. A single selected beat SHALL be divided into that many slots of the same total, with the content in the first slot. When at least that many beats are selected, the first N SHALL be grouped into one subdivision, one note per slot, adding the freed time as rests at the end of the bar. The bar SHALL keep its total, the first slot SHALL be selected, and a selection with fewer than N beats SHALL be rejected with a reason.

#### Scenario: Dividing a quarter into a triplet
- **WHEN** the user selects a quarter rest and chooses the subdivision of 3
- **THEN** the beat becomes three triplet eighth-note slots that together last one quarter

#### Scenario: Writing the notes of the group
- **WHEN** the user chooses a subdivision and then types a fret for each slot
- **THEN** the cursor advances through the slots and the group is filled with the written notes

#### Scenario: Content stays in the first slot
- **WHEN** the user subdivides a beat that already has a note
- **THEN** the note stays in the first slot and the other slots are rests

#### Scenario: The bar keeps adding up
- **WHEN** the user subdivides a beat in a bar that was complete
- **THEN** the bar is still complete and is not flagged

#### Scenario: Drawn and played with its number
- **WHEN** the tab is drawn and played
- **THEN** the subdivision is shown with its number and the playback uses its ratio

#### Scenario: Grouping three written notes
- **WHEN** the user selects three eighth notes and chooses the subdivision of 3
- **THEN** the three notes form one triplet group —not three separate triplets— and an eighth rest fills the freed time at the end of the bar

#### Scenario: Grouping three quarters
- **WHEN** the user selects three quarter notes and chooses the subdivision of 3
- **THEN** the three notes form one triplet group and a quarter rest fills the freed time

#### Scenario: More notes than the subdivision
- **WHEN** the user selects four notes and chooses the subdivision of 3
- **THEN** the first three notes form one triplet group, the fourth note stays as it was, and the freed time becomes an eighth rest at the end of the bar

#### Scenario: Fewer notes than the subdivision
- **WHEN** the user selects two beats and chooses the subdivision of 3
- **THEN** the action is disabled and the description asks for one beat or at least three

#### Scenario: Notes with different values
- **WHEN** the selected notes do not all have the same figure
- **THEN** the action is disabled and the description says they must last the same

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
