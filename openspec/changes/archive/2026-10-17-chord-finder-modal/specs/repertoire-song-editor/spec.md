# Spec Delta

## MODIFIED Requirements

### Requirement: Chord selector over the fretboard

The system SHALL provide a visual chord selector that draws the chord on a vertical fretboard showing only the frets used plus a small context, SHALL offer a chord finder opened from a compact trigger that shows the finder over the page without resizing the chord box, and SHALL offer a manually editable shape. The position control SHALL sit above the fretboard diagram so it keeps its place when the diagram changes height.

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

#### Scenario: The finder opens from a compact trigger
- **WHEN** the user opens the chord finder
- **THEN** it opens from a compact trigger in the chord box instead of a full-width control

#### Scenario: Opening the finder does not resize the chord box
- **WHEN** the chord finder opens or closes
- **THEN** the chord box keeps its size and the fretboard does not move
