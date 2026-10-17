# chord-voicings Specification

## Purpose
Offers several playable shapes (voicings) for the same chord so the player can pick the position and sonority they want, scoped to the chord being edited.

## Requirements

### Requirement: A chord offers several playable positions

The system SHALL offer more than one playable shape for a chord it can decompose, ordered from the lowest position on the fretboard to the highest.

#### Scenario: Several positions are offered
- **WHEN** the user looks at the positions of a chord the app can decompose
- **THEN** the app offers more than one playable shape

#### Scenario: Positions are ordered by fret
- **WHEN** the app lists the positions of a chord
- **THEN** they go from the lowest position on the fretboard to the highest

### Requirement: The chosen position is kept with the chord

The system SHALL store the shape the user picks as the chord's voicing, SHALL show the position that matches the shape on the fretboard as the current position, SHALL step to the next or previous position from the one being shown, and SHALL keep the user's own saved shape ahead of the generated ones.

#### Scenario: The picked position is stored
- **WHEN** the user assigns the chord after choosing a position
- **THEN** the app stores that shape with the chord

#### Scenario: The user's saved shape goes first
- **WHEN** the user has saved their own shape for the chord
- **THEN** it is offered before the generated positions

#### Scenario: The stored position is shown when the chord is edited again
- **WHEN** the user edits again a chord that has a stored shape matching one of the positions
- **THEN** the app shows that position as the current one

#### Scenario: The next position follows the one being shown
- **WHEN** the user moves to the next position after editing a chord whose stored shape matches a position
- **THEN** the app draws the position after the one being shown, not the first one twice

#### Scenario: A drawn shape that matches a position is shown as that position
- **WHEN** the user draws a shape equal to one of the chord's positions
- **THEN** the app shows that position as the current one

#### Scenario: A shape of the user's own keeps the last position
- **WHEN** the user draws a shape that matches none of the chord's positions
- **THEN** the app keeps the last chosen position in the control
