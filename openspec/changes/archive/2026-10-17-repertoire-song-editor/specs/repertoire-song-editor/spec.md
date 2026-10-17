# Spec Delta

## ADDED Requirements

### Requirement: Repertoire items are created on their own page

The system SHALL offer an "add new item" action in the repertoire list that navigates to a dedicated creation page, and SHALL keep the creation form out of the repertoire list.

#### Scenario: User opens the creation page
- **WHEN** the user activates the add-new-item action in the repertoire list
- **THEN** the app navigates to the repertoire creation page

#### Scenario: User saves a new item
- **WHEN** the user completes the creation form and saves
- **THEN** the app stores the item in the repertoire and opens its detail

### Requirement: Lyrics can carry chords at any position

The system SHALL let the user keep the lyrics of a song as one editable block of text and anchor a chord at any character position of a line, so a chord can sit at the start, in the middle or at the end of a word, in the gap between two words, or at the end of the line.

#### Scenario: User edits the lyrics
- **WHEN** the user edits the lyrics as a single block of text
- **THEN** the app shifts the chords along with the text, re-anchoring them to the following word, and drops only the ones whose word was rewritten

#### Scenario: User inserts text before a chord
- **WHEN** the user types new text before a chord
- **THEN** the app moves that chord to keep it over the same word

#### Scenario: User assigns a chord to a position
- **WHEN** the user picks a character position and assigns a chord
- **THEN** the app stores the chord at that position and draws it above that spot

#### Scenario: A chord between words
- **WHEN** the user picks a gap between two words or the end of the line
- **THEN** the app anchors the chord at that exact position

#### Scenario: User swaps a chord
- **WHEN** the user assigns a chord to a position that already had one
- **THEN** the app replaces the previous chord instead of adding a second one

#### Scenario: User removes a chord
- **WHEN** the user removes a chord
- **THEN** the app deletes that chord and leaves the lyrics untouched

#### Scenario: Nearby chords do not overlap
- **WHEN** two chords are anchored close together
- **THEN** the app shifts the drawing of the later one so the names stay readable without changing its anchor

### Requirement: Chord selector over the fretboard

The system SHALL provide a visual chord selector that draws the chord on a vertical fretboard showing only the frets used plus a small context, and SHALL offer both a chord library and a manually editable shape.

#### Scenario: User picks a chord from the library
- **WHEN** the user selects a chord from the library
- **THEN** the app draws its shape on the fretboard

#### Scenario: User edits the shape
- **WHEN** the user marks a fret on a string, or marks a string as open or muted
- **THEN** the app updates the drawn shape and stores it with the chord

#### Scenario: Fret window
- **WHEN** a chord uses frets far from the nut
- **THEN** the diagram shows only the used frets plus context and labels the base fret

### Requirement: Tab editor

The system SHALL provide a tab editor that is a grid of the song's strings by time positions, where notes are placed by interacting with cells instead of typing text, and SHALL use the song's tuning.

#### Scenario: User places a note
- **WHEN** the user selects a cell and enters a fret
- **THEN** the app stores that fret on that string and column and shows it in the cell

#### Scenario: User navigates with the keyboard
- **WHEN** the user presses the arrow keys on the grid
- **THEN** the app moves the selected cell in that direction and keeps entered notes

#### Scenario: User changes the resolution
- **WHEN** the user changes the resolution of the grid
- **THEN** the app rescales the existing notes to keep their timing

#### Scenario: User changes the number of measures
- **WHEN** the user removes measures
- **THEN** the app drops the notes that fall outside the remaining measures

#### Scenario: Song tuning is respected
- **WHEN** the song has a tuning
- **THEN** the tab editor labels its strings with that tuning

### Requirement: Song content persists with the item

The system SHALL store the chord chart and the tab as optional fields of the repertoire item so they are saved and loaded with it.

#### Scenario: Reloading the app
- **WHEN** the user reopens a song that has a chord chart and a tab
- **THEN** the app shows the stored lyrics with chords and the stored tab

#### Scenario: Editing a saved song
- **WHEN** the user changes the lyrics, the chords or the tab of a saved song
- **THEN** the app saves the change on that same song
