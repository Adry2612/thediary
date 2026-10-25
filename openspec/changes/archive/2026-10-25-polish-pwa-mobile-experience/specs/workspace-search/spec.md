# Spec Delta

## Purpose

Defines the single search control of the workspace, so every screen that filters a collection offers the same anatomy, the same accessible name and the same behaviour on a phone.

## ADDED Requirements

### Requirement: Every collection filter uses the shared search field

The system SHALL render the search or text filter of a collection through one shared search-field control with a visible label, a leading magnifier icon, the same height and typography as the other fields, and the full width available to it.

#### Scenario: Searching the repertoire
- **WHEN** the user opens the repertoire filters
- **THEN** the search shows its label, the magnifier and the same control height as the picks and fields around it

#### Scenario: Searching licks
- **WHEN** the user opens the licks library search
- **THEN** it looks and behaves like the repertoire search

#### Scenario: Searching inside a picker
- **WHEN** the user opens the song, technique or chord picker
- **THEN** its search field uses the same control and places the magnifier in the same position

#### Scenario: Filtering recordings
- **WHEN** the user filters recordings by block name
- **THEN** the text filter uses the same search control

### Requirement: The search field announces its purpose

The system SHALL expose the visible label as the accessible name of the search field and SHALL treat the magnifier as decorative, so the field is announced as a search box with the name the user reads.

#### Scenario: Reaching the search with a screen reader
- **WHEN** the user moves to a search field with a screen reader
- **THEN** it is announced as a search box named by its visible label, not by its placeholder alone

#### Scenario: The magnifier icon
- **WHEN** the user reaches the search with a screen reader
- **THEN** the magnifier is not announced as separate content

### Requirement: Typing filters without changing the layout on a phone

The system SHALL keep the search field inside the screen margins at every mobile width and SHALL update the filtered collection as the user types without shifting or overflowing the field.

#### Scenario: A narrow phone
- **WHEN** the search field renders at the narrowest supported width
- **THEN** it stays inside the section padding with the magnifier and the text visible

#### Scenario: Typing a long term
- **WHEN** the user types a term wider than the field
- **THEN** the text scrolls inside the field and the field keeps its size

#### Scenario: No matches
- **WHEN** the typed term matches no item
- **THEN** the screen shows its no-results state and the query stays in the field
