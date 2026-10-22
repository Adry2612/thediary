# app-accessibility Specification

## Purpose
Keeps the interface usable for everyone who reaches it with a screen reader, a keyboard or a pointer: readable secondary text, names and headings that say what they are, and targets big enough to hit.

## Requirements

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

### Requirement: A control that names itself includes the text it shows

The system SHALL compose the accessible name of a control whose name is set programmatically so that it contains the text the control shows, in the order the control shows it.

#### Scenario: A goal of the practice plan
- **WHEN** the user reaches the control that shows how many minutes of practice they aim for
- **THEN** its accessible name contains the value and the unit the control shows

#### Scenario: A day of the week
- **WHEN** the user reaches the cell of a day that shows the practice of that day
- **THEN** its accessible name contains the weekday, the day of the month and the count with the abbreviation the cell shows

### Requirement: A day of the calendar is a target of its own

The system SHALL give each day of the year calendar of the dashboard a target of at least 24×24 px, without changing the size of the square the calendar paints.

#### Scenario: A day of the year
- **WHEN** the user points at the square of a day of the year calendar
- **THEN** the area that responds to the pointer is at least 24×24 px

#### Scenario: Two days next to each other
- **WHEN** two days of the calendar are neighbours
- **THEN** their targets do not overlap

### Requirement: The headings of a screen descend in order

The system SHALL order the headings of a screen so that no level is skipped between one heading and the next.

#### Scenario: The card of the metronome
- **WHEN** the metronome screen shows its title and then the title of its card
- **THEN** the title of the card is a heading of the level that follows the title of the screen
