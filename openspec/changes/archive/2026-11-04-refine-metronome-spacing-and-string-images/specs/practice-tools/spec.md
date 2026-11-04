# Spec Delta

## ADDED Requirements

### Requirement: The beat row keeps its spacing and centres fewer beats

The metronome SHALL lay the beat dots out with the same column width and the same gap they have in a four-beat meter, and SHALL centre the group when the meter has two or three beats.

#### Scenario: A four-beat meter
- **WHEN** the user uses 4/4, 12/8 or 12/4
- **THEN** the four dots are spread across the card exactly as before

#### Scenario: A two-beat meter
- **WHEN** the user changes to 6/8 or 6/4
- **THEN** the two dots keep the four-beat column width and the group is centred in the card

#### Scenario: A three-beat meter
- **WHEN** the user changes to 9/8 or 9/4
- **THEN** the three dots keep the four-beat column width and the group is centred in the card

#### Scenario: A narrow screen
- **WHEN** the metronome is shown at 320 px wide with any meter
- **THEN** the dots stay inside the card without horizontal overflow

#### Scenario: The dots stay operable
- **WHEN** the user reaches a dot with the pointer or the keyboard
- **THEN** its size, its state and its accessible name are the same as before
