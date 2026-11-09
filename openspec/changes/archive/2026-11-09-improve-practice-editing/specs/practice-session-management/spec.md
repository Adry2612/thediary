# Spec Delta

## ADDED Requirements

### Requirement: A running practice can edit its current block

The system SHALL show an edit control beside the current block title while a practice runs, SHALL open an editor for that block only, and SHALL let the user change its category, linked content, name, planned duration, details and notes. Saving SHALL apply the changes to the active session immediately.

#### Scenario: The edit control sits beside the block title
- **WHEN** a block is current in a running practice
- **THEN** an edit control appears beside the block title for every category

#### Scenario: Changing the category
- **WHEN** the user changes the current block from repertoire to technique
- **THEN** the block's song, part and catalog reference are cleared and the technique name can be chosen

#### Scenario: Choosing a repertoire song
- **WHEN** the user opens the song picker and chooses a saved repertoire song
- **THEN** the block links to that song, its name becomes the song title, its previous part is cleared and the material and artist update

#### Scenario: Choosing a catalog song
- **WHEN** the user searches the catalog and picks a song that is not in the repertoire
- **THEN** the block keeps a temporary catalog reference with the title and artist and does not add the song to the repertoire

#### Scenario: Choosing a technique
- **WHEN** the user opens the technique picker and chooses a catalogue technique
- **THEN** the block stores that technique and shows its name according to the technique-name preference

#### Scenario: Choosing a theory topic
- **WHEN** the user opens the theory picker and chooses a catalogue topic
- **THEN** the block stores that topic and shows its name according to the technique-name preference

#### Scenario: Choosing a lick
- **WHEN** the user changes the current block to lick and chooses a lick
- **THEN** the block links to that lick and its material is shown

#### Scenario: A free-name category
- **WHEN** the current block is improvisation or another category without a catalogue
- **THEN** the editor offers a free-text name field

#### Scenario: Changing the planned duration
- **WHEN** the user edits the planned duration of the current block
- **THEN** the timer uses the new planned time for the rest of that block

#### Scenario: Changing the details and notes
- **WHEN** the user edits the block's details or notes
- **THEN** the active block stores them and the running practice keeps showing the updated details

#### Scenario: Cancelling the edit
- **WHEN** the user closes the editor without saving
- **THEN** the block keeps its previous values

#### Scenario: Missing required content
- **WHEN** a repertoire, technique, theory or lick block has no linked content
- **THEN** the editor does not apply the change and explains what is missing

#### Scenario: Other blocks are unaffected
- **WHEN** the user edits the current block
- **THEN** every other block keeps its own category, links, duration, details and notes

#### Scenario: Keyboard and screen reader
- **WHEN** the user opens the editor with the keyboard or assistive technology
- **THEN** the dialog has a name, every field is reachable and the result is announced on save

### Requirement: Editing the current block does not interrupt the running practice

Editing the current block SHALL NOT stop the timer, reset the elapsed time, advance the block, stop the metronome or stop an active recording.

#### Scenario: The timer keeps running
- **WHEN** the user edits the current block while the timer runs
- **THEN** the practice keeps counting and the current block does not advance

#### Scenario: The elapsed time is kept
- **WHEN** the user changes the block's name or category after ten minutes
- **THEN** the block keeps its ten elapsed minutes

#### Scenario: The metronome and recording keep running
- **WHEN** the user edits the current block while the metronome or a recording is active
- **THEN** both continue without stopping or restarting

#### Scenario: A shorter planned duration
- **WHEN** the user sets a planned duration below the elapsed time
- **THEN** the block follows the existing overtime or waiting rules for its setting instead of resetting the timer

#### Scenario: The saved practice keeps the edit
- **WHEN** the user finishes the practice after editing the current block
- **THEN** the saved practice uses the edited category, name, links, elapsed time, details and notes

### Requirement: Block notes edited during practice reach the saved practice

When a block's notes are edited during a running practice, the system SHALL pre-fill the completion dialog's notes for that block and SHALL store them with the saved practice; cleared notes SHALL NOT be stored.

#### Scenario: Pre-filled notes
- **WHEN** the practice ends after the current block's notes were edited
- **THEN** the completion dialog shows those notes for that block and the user can still change them

#### Scenario: Clearing the notes
- **WHEN** the user clears the block's notes before finishing
- **THEN** the saved practice stores no notes for that block

#### Scenario: Notes survive a reload
- **WHEN** the page reloads while the practice is active after editing the block's notes
- **THEN** the block still shows the edited notes

## MODIFIED Requirements

### Requirement: User can create a new routine or start a quick practice

The system SHALL keep creating a new practice that opens the routine editor as a secondary path, SHALL let that editor load a saved template as a copy that does not modify the template, SHALL start a quick practice as a free timed session without designing blocks or passing through the reviewing state, and SHALL keep saving a finished quick practice to the history.

#### Scenario: User creates a new practice
- **WHEN** the user chooses to create a new practice
- **THEN** the app opens the routine editor with the option to save the routine and to review it before starting

#### Scenario: User starts a quick practice
- **WHEN** the user starts a quick practice
- **THEN** the app begins a session that counts up freely with no designed blocks and lets the user finish at any time

#### Scenario: Quick practice is saved
- **WHEN** the user finishes a quick practice and saves it
- **THEN** the app records a practice session in the history that the user can edit afterwards like any other

#### Scenario: Loading a template while creating a new routine
- **WHEN** the user is creating a new routine and chooses a saved template
- **THEN** the editor copies the template's name, blocks and guitar into the new plan without marking the template as the routine being edited

#### Scenario: Saving the new routine
- **WHEN** the user saves a new routine that started from a template
- **THEN** the app stores a new routine with a new identity and leaves the template unchanged

#### Scenario: Editing an existing routine
- **WHEN** the user opens an existing routine for editing and saves it
- **THEN** the app updates that same routine instead of creating another one

#### Scenario: Deleting from the new-routine editor
- **WHEN** a new routine has loaded a template but has not been saved yet
- **THEN** the editor offers no delete action for the source template

#### Scenario: Saving twice
- **WHEN** the user saves the new routine and then changes it and saves again
- **THEN** the second save updates the routine created by the first save

#### Scenario: The template remains available
- **WHEN** the new routine has been saved from a template
- **THEN** the template and the new routine both appear in the saved-routines list

### Requirement: Saved practices can be edited

The system SHALL let the user edit a saved practice session, including its title, notes, completion state, duration and its blocks, SHALL use the searchable technique and theory pickers for those block categories, SHALL use the saved-repertoire and catalog song search for repertoire blocks, SHALL present every block's real time and the session duration as `mm:ss` or `h:mm:ss`, SHALL accept the same clock formats when typing, SHALL keep the reported totals consistent with the edited blocks, SHALL report an invalid time next to its field without losing the other edits, and SHALL NOT block a valid save because of a native number-step mismatch.

#### Scenario: User edits the blocks of a saved practice
- **WHEN** the user changes a block's name in a free-name category, its category, real time or planned time and saves
- **THEN** the app stores the edited blocks and reports a total duration and a per-category split consistent with them

#### Scenario: User removes every block
- **WHEN** the user removes all the blocks of a saved practice and saves
- **THEN** the app stores the practice without blocks and uses the duration provided directly

#### Scenario: Edited practice keeps its identity
- **WHEN** a saved practice is edited
- **THEN** the app updates that same practice in the history instead of adding a new one

#### Scenario: Editing seconds
- **WHEN** a saved block lasted 1 minute and 23 seconds
- **THEN** the editor shows `1:23` and keeps exactly 83 seconds when the practice is saved

#### Scenario: Typing a clock time
- **WHEN** the user types `1:23` or `83` in a block's real-time field
- **THEN** the block stores 83 seconds

#### Scenario: An invalid time
- **WHEN** the user types letters or a value with seconds above 59 in a real-time field
- **THEN** the field shows an error and the save reports it without a native browser validation error and without losing the other edits

#### Scenario: No decimal step error
- **WHEN** a saved practice has times that are not a multiple of half a minute
- **THEN** the editor opens and saves without a `step` validation error

#### Scenario: Editing a technique block
- **WHEN** the user changes a saved technique block
- **THEN** the editor offers the searchable technique picker instead of a free-text name field

#### Scenario: Editing a theory block
- **WHEN** the user changes a saved theory block
- **THEN** the editor offers the searchable theory picker instead of a free-text name field

#### Scenario: A previously stored custom name
- **WHEN** a saved technique or theory block has a name outside the catalogue
- **THEN** that name remains selectable in the picker and is displayed exactly as stored

#### Scenario: Searching the repertoire from a saved practice
- **WHEN** the user opens the song picker of a saved repertoire block
- **THEN** the picker offers both the saved repertoire and the external catalog search

#### Scenario: Changing the category clears the links
- **WHEN** the user changes a saved block from repertoire to another category
- **THEN** its song, part and catalog reference are cleared
