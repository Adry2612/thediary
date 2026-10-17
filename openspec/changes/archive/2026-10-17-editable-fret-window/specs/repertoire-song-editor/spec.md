# Spec Delta

## MODIFIED Requirements

### Requirement: Chord selector over the fretboard

The system SHALL provide a visual chord selector that draws the chord on a vertical fretboard, SHALL show it through a window of five frets that the user can move along the neck without changing the drawn shape, SHALL keep that window still while the user marks frets, SHALL keep the fretboard centred in the chord box, SHALL offer a chord finder opened from a compact trigger that shows the finder over the page without resizing the chord box, and SHALL offer a manually editable shape that starts with every string open. The position control SHALL sit above the fretboard diagram so it keeps its place when the diagram changes height.

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
- **THEN** the diagram shows them inside a window of five frets and labels its base fret

#### Scenario: The finder opens from a compact trigger
- **WHEN** the user opens the chord finder
- **THEN** it opens from a compact trigger in the chord box instead of a full-width control

#### Scenario: Opening the finder does not resize the chord box
- **WHEN** the chord finder opens or closes
- **THEN** the chord box keeps its size and the fretboard does not move

#### Scenario: A shape beyond the first frets can be drawn
- **WHEN** the user draws a chord whose shape uses frets that are not in the window
- **THEN** the user can move the window along the neck and mark them

#### Scenario: The window does not shrink while drawing
- **WHEN** the user marks a fret
- **THEN** the frets shown in the window stay the same

#### Scenario: The window follows the chord
- **WHEN** the user picks a name or another position
- **THEN** the window moves to show the frets of that shape

#### Scenario: The fretboard stays centred
- **WHEN** the chord box shows the arrows that move the fret window
- **THEN** the fretboard stays centred in the chord box

#### Scenario: A new chord starts with the strings open
- **WHEN** the user starts drawing a chord that has no shape yet
- **THEN** every string starts open and the user mutes the ones that should not sound
