# Spec Delta

## ADDED Requirements

### Requirement: Secondary text is readable

The system SHALL paint the secondary text of the interface —the labels, captions and meta lines of the screens— in a tone whose contrast against the surface it sits on is at least 4.5:1.

#### Scenario: A card shows its description
- **WHEN** a card shows a description under its value
- **THEN** that description keeps a contrast of at least 4.5:1 against the card

#### Scenario: A caption over the canvas
- **WHEN** a screen shows a caption directly over the page background
- **THEN** that caption keeps a contrast of at least 4.5:1 against it

#### Scenario: A caption over the darkest surface
- **WHEN** a panel uses the darkest surface of the app
- **THEN** the captions inside it keep a contrast of at least 4.5:1

### Requirement: The select announces the value it shows

The system SHALL expose as the accessible name of the select control both the name of the field and the label of the value it is showing, so the text the user reads is part of the name, and SHALL use the name of the field alone when it shows no value.

#### Scenario: A filter with a value
- **WHEN** the user reaches a filter that is showing a value
- **THEN** its accessible name contains the name of the field and the text of that value

#### Scenario: A field with nothing selected
- **WHEN** the user reaches a select that shows no value
- **THEN** its accessible name is the name of the field

### Requirement: A label sits on an element that can carry it

The system SHALL place the accessible label of an indicator, such as the state of a beat of the metronome, on an element that supports an accessible name, and SHALL NOT place one on a plain generic element.

#### Scenario: The beats of the metronome
- **WHEN** the metronome draws the dots of its beats
- **THEN** each dot announces its beat and whether it is the active one
