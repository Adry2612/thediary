# Spec Delta

## ADDED Requirements

### Requirement: Lyrics wrap by word without horizontal scrolling

The system SHALL continue a lyric line that is wider than the available space on a further row, breaking at word boundaries, without horizontal scrolling, and SHALL leave every chord anchored to the same text position.

#### Scenario: A long line wraps
- **WHEN** a lyric line does not fit the available width
- **THEN** the app continues it on the next row at a word boundary instead of scrolling horizontally

#### Scenario: Resizing reflows the line
- **WHEN** the available width changes
- **THEN** the app reflows the line to the new width

#### Scenario: A chord name does not fit at the row edge
- **WHEN** a chord's name does not fit at the end of a row
- **THEN** the app draws it at the start of the next row without changing its anchor

#### Scenario: A chord sits in a space the wrap consumes
- **WHEN** the wrap consumes the space where a chord is anchored
- **THEN** the app keeps the chord at the end of the previous row

### Requirement: Blank lyric lines separate stanzas

The system SHALL draw a blank line of the lyrics as a stanza break and SHALL treat several consecutive blank lines as a single break.

#### Scenario: A blank line separates two stanzas
- **WHEN** a blank line separates two lines of lyrics
- **THEN** the app leaves a blank row between them

#### Scenario: Consecutive blank lines
- **WHEN** there are several blank lines in a row
- **THEN** the app draws a single stanza break

### Requirement: The chord name is editable and drives the selector

The system SHALL let the user edit the chord name and SHALL treat it as the source of truth, so the note selector, the type selector and the fretboard drawing follow it whenever the name can be decomposed into a root note and a type.

#### Scenario: Typing a recognised chord
- **WHEN** the user types a chord the app can decompose
- **THEN** the note and type selectors and the drawing update to match

#### Scenario: Changing a selector
- **WHEN** the user changes the note or the type selector
- **THEN** the name and the drawing update

#### Scenario: An unrecognised name
- **WHEN** the user types a name the app cannot decompose
- **THEN** the selectors show no value and the name is kept as written

### Requirement: Chord shapes are generated when the library has none

The system SHALL compute a playable shape for a recognised chord that is not in the built-in library, SHALL prefer the built-in shape when one exists, and SHALL store the drawn shape with the chord.

#### Scenario: A missing combination
- **WHEN** the user builds a chord that is not in the built-in library
- **THEN** the app draws a computed shape

#### Scenario: The library is preferred
- **WHEN** the chord exists in the built-in library
- **THEN** the app draws the built-in shape

#### Scenario: The shape is stored
- **WHEN** the user assigns the chord to a position
- **THEN** the app stores the drawn shape with it

### Requirement: Saved chords are shown apart and marked

The system SHALL list the user's saved chords in a clearly marked group separate from the standard chords, SHALL offer saved chords with no recognised root note in a general group available whatever note is selected, and SHALL mark the chord as "personalizado" when its shape comes from the user's saved chords.

#### Scenario: Saved chords appear grouped
- **WHEN** the selector lists chords for a note
- **THEN** the user's saved chords for that note appear in a marked group after the standard ones

#### Scenario: A saved chord without a root note
- **WHEN** a saved chord has no recognised root note
- **THEN** the app offers it in a general group regardless of the selected note

#### Scenario: The chord is marked as the user's own
- **WHEN** the drawn chord comes from the user's saved chords
- **THEN** the app shows a "personalizado" label

### Requirement: Clearing a chord is offered only when one is assigned

The system SHALL offer the clear action only when the selected position already holds a chord.

#### Scenario: A position that holds a chord
- **WHEN** the user selects a position that holds a chord
- **THEN** the app offers the clear action

#### Scenario: A position with no chord
- **WHEN** the user selects a position with no chord
- **THEN** the app does not offer the clear action
