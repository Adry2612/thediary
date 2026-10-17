# Spec Delta

## Purpose

Offers several playable shapes (voicings) for the same chord so the player can pick the position and sonority they want, scoped to the chord being edited.

## ADDED Requirements

### Requirement: A chord offers several playable positions

The system SHALL offer more than one playable shape for a chord it can decompose, ordered from the lowest position on the fretboard to the highest.

#### Scenario: Several positions are offered
- **WHEN** the user looks at the positions of a chord the app can decompose
- **THEN** the app offers more than one playable shape

#### Scenario: Positions are ordered by fret
- **WHEN** the app lists the positions of a chord
- **THEN** they go from the lowest position on the fretboard to the highest

### Requirement: The chosen position is kept with the chord

The system SHALL store the shape the user picks as the chord's voicing, and SHALL keep the user's own saved shape ahead of the generated ones.

#### Scenario: The picked position is stored
- **WHEN** the user assigns the chord after choosing a position
- **THEN** the app stores that shape with the chord

#### Scenario: The user's saved shape goes first
- **WHEN** the user has saved their own shape for the chord
- **THEN** it is offered before the generated positions
