# Spec Delta

## Purpose

Lets the user practise a saved lick inside a structured session and keeps the lick's practice record in sync with the time actually spent on it.

## ADDED Requirements

### Requirement: A lick practice block is linked to a saved lick

The system SHALL provide a Lick block category, SHALL require every Lick block to reference one lick from the licks library, and SHALL offer only licks in that selector.

#### Scenario: Choosing a lick
- **WHEN** the user selects the Lick category for a block
- **THEN** the block offers a selector with the saved licks and no songs

#### Scenario: A lick block without a link cannot start
- **WHEN** a Lick block has no lick selected
- **THEN** the routine cannot be saved or started and the block shows the missing link

#### Scenario: A stored lick disappears
- **WHEN** a routine references a lick that no longer exists
- **THEN** the editor shows the missing reference and requires another lick before the routine can start

#### Scenario: Changing the category clears the lick
- **WHEN** a Lick block is changed to another category
- **THEN** its lick reference is removed

### Requirement: A lick block shows the lick as its material

The system SHALL show the linked lick's title, techniques and tablature as the material of the Lick block during practice, and SHALL NOT play or synthesize that tablature.

#### Scenario: Practising a lick block
- **WHEN** the current block is a Lick block
- **THEN** the practice screen shows that lick's title, techniques and tablature

#### Scenario: Switching away from the block
- **WHEN** the user moves to another block
- **THEN** the previous lick's material is no longer shown

#### Scenario: No playback
- **WHEN** the user views the lick material during practice
- **THEN** the app offers no play, metronome or synthesis control for that tablature

### Requirement: A completed lick block counts in the lick's progress

The system SHALL, when a practice with at least one elapsed Lick block is saved, increase that lick's practice count by one and set its last-practised date to the practice date, exactly once per lick per saved session, without changing its BPM history or target.

#### Scenario: Saving a session with a lick block
- **WHEN** the user saves a practice containing an elapsed Lick block
- **THEN** the lick's practice count increases by one and its last-practised date becomes the practice date

#### Scenario: Repeating the same lick in one session
- **WHEN** one saved session contains two Lick blocks for the same lick
- **THEN** the lick's practice count increases by one, not two

#### Scenario: The BPM history is untouched
- **WHEN** a Lick block is completed
- **THEN** no BPM entry is added and the current and target BPM stay the same

#### Scenario: Discarding the session
- **WHEN** the user discards the practice without saving it
- **THEN** no lick's progress changes

### Requirement: Lick links persist with the practice data

The system SHALL store the lick reference in the practice phase and in the saved session block, SHALL keep it when the practice data is merged or reloaded, and SHALL load old practice data that has no lick references.

#### Scenario: Reloading a routine
- **WHEN** the user reloads the app after saving a routine with a Lick block
- **THEN** the block still references the same lick

#### Scenario: Old data has no lick links
- **WHEN** the app loads practice data saved before this change
- **THEN** the routines and sessions load without lick blocks and without errors

#### Scenario: Repeating a saved session
- **WHEN** the user repeats a saved session that contains a Lick block
- **THEN** the new plan keeps the same lick reference
