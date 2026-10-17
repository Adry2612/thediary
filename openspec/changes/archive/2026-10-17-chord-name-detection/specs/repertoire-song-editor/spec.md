# Spec Delta

## ADDED Requirements

### Requirement: Drawing a shape names the chord

The system SHALL name the chord drawn on the fretboard when the sounding notes form a chord it knows, and SHALL leave the name unchanged when they do not.

#### Scenario: A drawn chord is named
- **WHEN** the user marks frets and open strings that form a chord the app knows
- **THEN** the app writes that chord's name

#### Scenario: A drawn shape the app does not know
- **WHEN** the drawn notes do not form any chord the app knows
- **THEN** the app leaves the name as it was

#### Scenario: The same notes fit more than one name
- **WHEN** the drawn notes fit more than one chord the app knows
- **THEN** the app names the one whose root is the lowest sounding note
