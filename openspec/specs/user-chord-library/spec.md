# user-chord-library Specification

## Purpose
Lets a user keep their own chord shapes, reuse them across their songs and remove them, scoped to their account.

## Requirements

### Requirement: Users can save their own chords

The system SHALL let the user save a chord of their own — a name plus a fingering shape — to their account, alongside the built-in chord library.

#### Scenario: Saving a custom chord
- **WHEN** the user saves a chord that is not in the built-in library
- **THEN** the app stores it in that user's collection of chords

#### Scenario: The saved chord survives a reload
- **WHEN** the user reopens the app
- **THEN** the app still offers the saved chord

#### Scenario: Chords belong to their account
- **WHEN** a different user signs in
- **THEN** the app does not offer the first user's saved chords

### Requirement: Saved chords resolve ahead of the built-in library

The system SHALL resolve a chord's shape from the user's saved chords first and from the built-in library afterwards.

#### Scenario: Reusing a saved chord
- **WHEN** the user selects or types the name of a saved chord
- **THEN** the app draws the shape the user saved

#### Scenario: A saved chord shadows a built-in one
- **WHEN** a saved chord has the same name as a built-in chord
- **THEN** the app uses the saved one

### Requirement: Users can remove their chords

The system SHALL let the user delete a saved chord from their collection.

#### Scenario: Deleting a saved chord
- **WHEN** the user deletes a saved chord
- **THEN** the app stops offering it and falls back to the built-in behaviour for that name

### Requirement: Saved chords persist and sync with the user's data

The system SHALL store the user's saved chords together with their practice data, so they are saved, loaded and synced with it.

#### Scenario: Saved with the user's data
- **WHEN** the user saves a chord
- **THEN** the app stores it as part of that user's practice data

#### Scenario: Merged on load
- **WHEN** the app loads the user's data from local and cloud
- **THEN** it merges the saved chords by identifier without duplicating them
