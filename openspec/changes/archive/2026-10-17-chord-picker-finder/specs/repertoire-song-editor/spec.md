# Spec Delta

## MODIFIED Requirements

### Requirement: Chord selector over the fretboard

The system SHALL provide a visual chord selector that draws the chord on a vertical fretboard showing only the frets used plus a small context, SHALL offer a chord finder to pick a chord from the library, and SHALL offer a manually editable shape. The position control SHALL sit above the fretboard diagram so it keeps its place when the diagram changes height.

#### Scenario: The position control keeps its place
- **WHEN** the drawn shape uses more or fewer frets
- **THEN** the position control stays above the diagram without moving

#### Scenario: User picks a chord from the library
- **WHEN** the user picks a chord in the chord finder
- **THEN** the app draws its shape on the fretboard

#### Scenario: User edits the shape
- **WHEN** the user marks a fret on a string, or marks a string as open or muted
- **THEN** the app updates the drawn shape and stores it with the chord

#### Scenario: Fret window
- **WHEN** a chord uses frets far from the nut
- **THEN** the diagram shows only the used frets plus context and labels the base fret

### Requirement: The chord name is editable and drives the selector

The system SHALL let the user edit the chord name and SHALL treat it as the source of truth, so the chord finder and the fretboard drawing follow it whenever the name can be decomposed into a root note and a type.

#### Scenario: Typing a recognised chord
- **WHEN** the user types a chord the app can decompose
- **THEN** the chord finder marks it as selected and the drawing updates to match

#### Scenario: Changing a selector
- **WHEN** the user picks a chord in the finder
- **THEN** the name and the drawing update

#### Scenario: An unrecognised name
- **WHEN** the user types a name the app cannot decompose
- **THEN** the finder shows no chord selected and the name is kept as written

### Requirement: Saved chords are shown apart and marked

The system SHALL list the user's saved chords in a clearly marked group separate from the standard chords inside the chord finder, SHALL offer saved chords with no recognised root note in a general group, and SHALL mark the chord as "personalizado" when its shape comes from the user's saved chords.

#### Scenario: Saved chords appear grouped
- **WHEN** the user opens the chord finder
- **THEN** the user's saved chords appear in a marked group after the standard ones

#### Scenario: A saved chord without a root note
- **WHEN** a saved chord has no recognised root note
- **THEN** the app offers it in a general group

#### Scenario: The chord is marked as the user's own
- **WHEN** the drawn chord comes from the user's saved chords
- **THEN** the app shows a "personalizado" label
