# Spec Delta

## ADDED Requirements

### Requirement: Wrapped rows are spaced tighter than new lines

The system SHALL draw the continuation rows of a wrapped lyric line closer together than the first row of a new line, and SHALL keep the stanza break separated from both.

#### Scenario: Continuation rows sit tighter
- **WHEN** a lyric line wraps into several rows
- **THEN** its continuation rows sit closer together than rows that belong to different lines

#### Scenario: A new line keeps its air
- **WHEN** a new lyric line starts after a wrapped one
- **THEN** the gap before its first row is bigger than between continuation rows

#### Scenario: The stanza break stays separated
- **WHEN** a blank line separates two stanzas
- **THEN** the gap at the break is at least as big as between different lines

### Requirement: The chord picker offers a position control

The system SHALL let the user step through the available positions of the chord in the picker and SHALL draw the selected one.

#### Scenario: Stepping through positions
- **WHEN** the chord has more than one position and the user moves to another one
- **THEN** the drawing and the shape to assign change to that position

#### Scenario: A single position
- **WHEN** the chord has only one position
- **THEN** the picker does not offer more positions
