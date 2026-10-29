# Spec Delta

## MODIFIED Requirements

### Requirement: Practice screen surfaces saved routines

The practice screen SHALL be a three-state flow: choosing, reviewing and practising. The choosing state SHALL present the saved practice routines as its primary content, with the quick practice and the routine editor as secondary actions, and every state SHALL offer a single primary action.

#### Scenario: User opens the practice screen with saved routines
- **WHEN** the user opens the practice screen and at least one routine is saved
- **THEN** the app lists the saved routines first, each with a way to start it and to edit it

#### Scenario: User starts a saved routine from the list
- **WHEN** the user chooses to start a saved routine
- **THEN** the app moves to the reviewing state with the plan of that routine instead of starting the timer immediately

#### Scenario: Reviewing the plan
- **WHEN** the reviewing state is shown
- **THEN** it shows the routine name, its blocks, the total planned time and the chosen guitar type, with a single primary action to start

#### Scenario: Starting from the review
- **WHEN** the user starts the reviewed plan
- **THEN** the app begins the practice session with exactly the blocks that were reviewed

#### Scenario: Going back without starting
- **WHEN** the user goes back from the reviewing state
- **THEN** the app returns to the choosing state and no session starts

#### Scenario: Editing from the choosing state
- **WHEN** the user chooses to edit a routine
- **THEN** the routine editor opens as a secondary path and the choosing state keeps its primary action

### Requirement: User can create a new routine or start a quick practice

The system SHALL keep creating a new practice that opens the routine editor as a secondary path, SHALL start a quick practice as a free timed session without designing blocks or passing through the reviewing state, and SHALL keep saving a finished quick practice to the history.

#### Scenario: User creates a new practice
- **WHEN** the user chooses to create a new practice
- **THEN** the app opens the routine editor with the option to save the routine and to review it before starting

#### Scenario: User starts a quick practice
- **WHEN** the user starts a quick practice
- **THEN** the app begins a session that counts up freely with no designed blocks and lets the user finish at any time

#### Scenario: Quick practice is saved
- **WHEN** the user finishes a quick practice and saves it
- **THEN** the app records a practice session in the history that the user can edit afterwards like any other

## ADDED Requirements

### Requirement: A finished practice is saved from a compact sheet

The system SHALL close a finished practice with a compact sheet that shows the summary first, keeps the session notes behind a collapsed action and leaves the save action as the only primary button.

#### Scenario: Opening the completion sheet
- **WHEN** a practice finishes
- **THEN** the sheet shows the total time and the practice summary before any input

#### Scenario: Writing notes
- **WHEN** the user activates the notes action
- **THEN** the session notes field expands in place and the summary stays visible

#### Scenario: Saving
- **WHEN** the user saves the practice
- **THEN** the sheet closes and the practice is stored exactly as before

#### Scenario: Leaving without saving
- **WHEN** the user chooses to exit without saving
- **THEN** the sheet offers the same discard confirmation it offered before

### Requirement: Mood and focus are optional session metrics

The system SHALL let the user record a mood value and a focus value for a practice, each on a five-emoji scale, asked at the end of the practice about the state the user had when starting it. Both metrics SHALL be off by default, SHALL be enabled independently from a settings section, SHALL be skippable, and SHALL only be stored when they were enabled and answered.

#### Scenario: Both metrics are off
- **WHEN** the user finishes a practice with mood and focus disabled
- **THEN** the completion sheet asks neither and the session is stored without them

#### Scenario: Only one metric is on
- **WHEN** the user enables mood but not focus
- **THEN** the completion sheet asks only for mood

#### Scenario: Answering the scale
- **WHEN** the user picks one of the five emojis for mood or focus
- **THEN** the chosen value is selected visibly and the session stores it with a value from one to five

#### Scenario: Skipping the question
- **WHEN** the user saves the practice without choosing an emoji
- **THEN** the practice is saved and that metric stays empty

#### Scenario: Returning to a session without metrics
- **WHEN** a stored practice has no mood or focus
- **THEN** it loads and behaves exactly as before

### Requirement: The recorder behaves like a tape deck

The recorder SHALL sit inside a framed display with the waveform drawn inside it, SHALL move the live waveform from right to left while recording and SHALL keep the complete waveform of the recorded take inside the same frame after stopping. Its controls SHALL be a transport row —record, stop, play, pause, rewind and forward— instead of a single form button, and every control SHALL keep an accessible name and a disabled state that matches what it can do.

#### Scenario: Recording
- **WHEN** the user starts recording
- **THEN** the frame shows the incoming waveform moving from right to left and the record control becomes the active state

#### Scenario: Stopping
- **WHEN** the user stops recording
- **THEN** the take is saved and its complete waveform is drawn inside the frame

#### Scenario: Playing a take
- **WHEN** the user plays a saved take
- **THEN** the transport shows playback, pause becomes available and the playhead moves over the waveform

#### Scenario: Seeking
- **WHEN** the user activates rewind or forward during playback
- **THEN** playback moves back or ahead by a short fixed step and the waveform follows the new position

#### Scenario: Unavailable controls
- **WHEN** no take is selected or nothing is recording
- **THEN** the controls that cannot act are disabled instead of doing nothing silently

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** the live waveform updates without a continuous scrolling animation

### Requirement: Saving a routine confirms the result

The system SHALL confirm in place when a routine is saved or updated, SHALL announce the confirmation to assistive technology, SHALL clear it after a short time and SHALL report a failure with an error instead of silence.

#### Scenario: Saving a new routine
- **WHEN** the user saves a routine for the first time
- **THEN** a confirmation naming the saved routine appears next to the actions and is announced

#### Scenario: Updating a routine
- **WHEN** the user saves changes to an existing routine
- **THEN** the confirmation says the routine was updated

#### Scenario: The confirmation clears
- **WHEN** a few seconds pass after saving
- **THEN** the confirmation disappears without moving the surrounding controls

#### Scenario: Saving fails
- **WHEN** the routine cannot be saved
- **THEN** the app shows an error message and keeps the editor open with its contents
