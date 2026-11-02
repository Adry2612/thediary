# Spec Delta

## MODIFIED Requirements

### Requirement: A tab is a score of bars made of timed beats

The system SHALL store a tab as an ordered list of bars, each holding timed beats, where a beat has a duration and is either a beat with notes, a rest or an empty beat, and SHALL allow between 1 and 64 bars.

#### Scenario: A new tab
- **WHEN** the user opens the editor for an item that has no tab
- **THEN** the tab starts with one 4/4 bar holding a whole-bar rest

#### Scenario: Several notes in one beat
- **WHEN** the user writes frets on different strings of the same beat
- **THEN** the beat holds all those notes and they sound together

#### Scenario: The item's tuning is respected
- **WHEN** the item has a tuning
- **THEN** the strings of the tab are labelled with the notes of that tuning

#### Scenario: Reaching the bar limit
- **WHEN** the tab already has 64 bars and the user tries to add another
- **THEN** the app does not add it and tells the user the limit has been reached

#### Scenario: An empty beat
- **WHEN** a beat has no notes and is not marked as a rest
- **THEN** it keeps its duration, fills its time in the bar, draws no rest figure and is announced as empty instead of as a rest

#### Scenario: An empty beat becomes a note
- **WHEN** the user writes a fret on an empty beat
- **THEN** the beat holds that note and stops being empty

### Requirement: A note or a beat can be selected and kept in view

The system SHALL let the user select a note or a beat by clicking or tapping it, SHALL mark the selection with an outline and a background rather than colour alone, SHALL move it with the arrow keys between beats, strings and bars so that the up arrow moves to the string drawn above and the down arrow to the string drawn below, SHALL extend it to a range of beats with Shift, and SHALL keep it in view while it moves.

#### Scenario: Selecting a note
- **WHEN** the user clicks a note
- **THEN** that note is selected and highlighted

#### Scenario: Selecting a rest or an empty position
- **WHEN** the user clicks a rest or an empty position of a beat
- **THEN** that beat is selected on the string nearest to the click

#### Scenario: Moving between strings
- **WHEN** the user presses the up arrow
- **THEN** the selection moves to the string drawn immediately above the current one, and the down arrow moves to the one drawn below

#### Scenario: Moving across bars
- **WHEN** the user presses the right arrow on the last beat of a bar
- **THEN** the selection moves to the first beat of the next bar, continuing on the next row if needed

#### Scenario: Extending a range
- **WHEN** the user presses Shift with an arrow key
- **THEN** the selection grows to cover the beats between its start and the new position

#### Scenario: The selection survives an edit
- **WHEN** the user edits the selected note
- **THEN** the same note stays selected after the tab is redrawn

#### Scenario: Clearing the selection
- **WHEN** the user presses Escape with a selection and no palette open
- **THEN** the selection is cleared

### Requirement: Rests and ties can be set on a beat

The system SHALL let the user turn the selected beats into rests, SHALL let the user tie the selected note to the previous note on the same string, SHALL remove a tie whose source note no longer exists, and SHALL keep rests distinct from empty beats: only a beat explicitly turned into a rest is drawn and announced as a rest.

#### Scenario: Turning a note into a rest
- **WHEN** the user turns the selected beat into a rest
- **THEN** the beat keeps its duration and its notes are removed

#### Scenario: Turning a rest into an empty beat
- **WHEN** the user removes the rest mark from a beat
- **THEN** the beat keeps its duration but draws no rest figure and is announced as empty

#### Scenario: Tying a note
- **WHEN** the user ties the selected note and the previous beat has a note on the same string
- **THEN** the note is drawn and played as a continuation of the previous note

#### Scenario: Nothing to tie to
- **WHEN** the previous beat has no note on the selected string
- **THEN** the tie option is unavailable and the palette says why

#### Scenario: The source note is deleted
- **WHEN** the user deletes the note a tie continues
- **THEN** the tie is removed and the tied note stays as a normal note

### Requirement: Notes, beats and bars can be copied, cut, pasted and deleted

The system SHALL let the user copy, cut and paste the selected beats or bars, within a tab and between tabs in the same session, and SHALL let the user delete the selected note, beat or bar as separate actions, leaving a beat whose last note is deleted empty rather than turning it into a rest.

#### Scenario: Copying beats
- **WHEN** the user copies selected beats and pastes at another beat
- **THEN** the copied beats are inserted there with their notes, durations and techniques

#### Scenario: Pasting between tabs
- **WHEN** the user copies bars in one tab and pastes them in another tab in the same session
- **THEN** the bars appear in the second tab

#### Scenario: Deleting a note
- **WHEN** the user deletes the selected note and it was the only one in its beat
- **THEN** the beat keeps its duration and becomes empty, with no rest figure and no silence in playback

#### Scenario: Deleting a note from a chord
- **WHEN** the user deletes one of several notes of a beat
- **THEN** the other notes stay in the beat and the beat is neither a rest nor empty

#### Scenario: Deleting a beat
- **WHEN** the user deletes the selected beat
- **THEN** the beat is removed, and the bar is flagged if it no longer adds up

#### Scenario: Deleting a bar
- **WHEN** the user deletes the selected bar
- **THEN** the bar and its beats are removed and the following bars move up
