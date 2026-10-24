# Spec Delta

## ADDED Requirements

### Requirement: A saved practice records the guitar type used

The system SHALL let the user choose electric or acoustic guitar for a practice session, SHALL offer that choice while the practice runs, in manual practice entry and in the session editor, and SHALL store the chosen type with the session. The type SHALL be optional and SHALL never be inferred from a song when the user has not chosen one.

#### Scenario: Choosing the guitar while practising
- **WHEN** the user selects electric or acoustic in a running practice
- **THEN** the session uses that type and the saved practice stores it

#### Scenario: Changing the guitar during the session
- **WHEN** the user changes the guitar type before finishing the practice
- **THEN** the saved practice stores the last chosen type for the whole session

#### Scenario: Manual practice
- **WHEN** the user records a practice manually and chooses a guitar type
- **THEN** the saved practice stores that type

#### Scenario: Editing a saved practice
- **WHEN** the user edits a saved practice and changes its guitar type
- **THEN** the practice stores the new type and the dashboard balance uses it

#### Scenario: Clearing the guitar type
- **WHEN** the user chooses not to specify the guitar type in the session editor
- **THEN** the practice keeps no guitar type and counts as unclassified

#### Scenario: Practice from before this change
- **WHEN** a stored practice has no guitar type
- **THEN** it loads normally and remains unclassified instead of receiving an invented type

#### Scenario: Last used type
- **WHEN** the user starts a new practice after having chosen a guitar type before
- **THEN** the choice starts on the last used type and the user can change it

#### Scenario: Stored type survives reload and sync
- **WHEN** a practice with a guitar type is reloaded or merged from another device
- **THEN** the type is preserved, and an invalid stored value is discarded without losing the practice

### Requirement: A saved practice keeps the average BPM of each block

The system SHALL record an average BPM for each block of a timed practice, using only that block's metronome time, and SHALL keep that value when the practice is edited, reloaded or synchronized.

#### Scenario: A practice with several blocks
- **WHEN** a practice with several blocks is saved and the metronome ran at different tempos in each block
- **THEN** each block stores its own average BPM

#### Scenario: Tempo changes inside a block
- **WHEN** the metronome tempo changes while a block is running
- **THEN** that block's average BPM is weighted by the time spent at each tempo

#### Scenario: A block without metronome
- **WHEN** a block finishes without the metronome having run
- **THEN** the block stores no average BPM

#### Scenario: Manual practice
- **WHEN** a practice is recorded manually
- **THEN** its blocks store no average BPM

#### Scenario: Practice from before this change
- **WHEN** a stored practice has no per-block BPM
- **THEN** it loads normally and its blocks remain without a per-block value

#### Scenario: Editing other fields
- **WHEN** the user edits a saved practice's title, notes or block duration without changing its tempo
- **THEN** the stored per-block average BPM is preserved

#### Scenario: Stored BPM survives reload and sync
- **WHEN** a practice with per-block BPM is reloaded or merged from another device
- **THEN** its per-block values are preserved, and an invalid stored value is discarded without losing the block
