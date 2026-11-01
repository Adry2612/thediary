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

### Requirement: A beat can be divided into an irregular subdivision

The system SHALL offer subdivisions of 3, 5, 6, 7, 9, 10 and 12 equal parts, SHALL replace each selected beat with that many slots whose total length equals the original beat, SHALL keep the existing content in the first slot and make the remaining slots rests, SHALL select the first slot, and SHALL keep the bar's total length.

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

#### Scenario: Several beats selected
- **WHEN** the user selects several beats and chooses a subdivision
- **THEN** every selected beat is divided into that many slots and the bar keeps its total length

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
