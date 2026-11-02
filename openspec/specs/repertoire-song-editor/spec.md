# repertoire-song-editor Specification

## Purpose
Lets the user write a song's content by hand in the repertoire: the lyrics with chords placed at any position, the chord shapes and the library they come from, and the tablature with its frets and performance techniques, all editable from the song's page and kept with the item.

## Requirements

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

### Requirement: The chord is drawn on a vertical fretboard

The system SHALL draw the selected chord on a vertical fretboard of six strings and SHALL keep that fretboard centred in the chord box.

#### Scenario: User picks a chord from the library
- **WHEN** the user picks a chord in the chord finder
- **THEN** the app draws its shape on the fretboard

#### Scenario: The fretboard stays centred
- **WHEN** the chord box shows the arrows that move the fret window
- **THEN** the fretboard stays centred in the chord box

### Requirement: The user can edit the shape by hand

The system SHALL let the user mark a fret on a string or mark a string as open or muted, SHALL start a shape that has none with every string open, and SHALL store the edited shape with the chord.

#### Scenario: User edits the shape
- **WHEN** the user marks a fret on a string, or marks a string as open or muted
- **THEN** the app updates the drawn shape and stores it with the chord

#### Scenario: A new chord starts with the strings open
- **WHEN** the user starts drawing a chord that has no shape yet
- **THEN** every string starts open and the user mutes the ones that should not sound

### Requirement: The fretboard shows a window of five frets that can be moved

The system SHALL show the chord through a window of five frets and SHALL label the base fret of that window, SHALL let the user move the window along the neck without changing the drawn shape, and SHALL keep the window still while the user marks frets.

#### Scenario: Fret window
- **WHEN** a chord uses frets far from the nut
- **THEN** the diagram shows them inside a window of five frets and labels its base fret

#### Scenario: A shape beyond the first frets can be drawn
- **WHEN** the user draws a chord whose shape uses frets that are not in the window
- **THEN** the user can move the window along the neck and mark them

#### Scenario: The window does not shrink while drawing
- **WHEN** the user marks a fret
- **THEN** the frets shown in the window stay the same

#### Scenario: The window follows the chord
- **WHEN** the user picks a name or another position
- **THEN** the window moves to show the frets of that shape

### Requirement: The chord finder opens from a compact trigger

The system SHALL offer a chord finder opened from a compact trigger inside the chord box, SHALL show it over the page, and SHALL keep the size of the chord box while the finder opens and closes.

#### Scenario: The finder opens from a compact trigger
- **WHEN** the user opens the chord finder
- **THEN** it opens from a compact trigger in the chord box instead of a full-width control

#### Scenario: Opening the finder does not resize the chord box
- **WHEN** the chord finder opens or closes
- **THEN** the chord box keeps its size and the fretboard does not move

### Requirement: The position control keeps its place above the diagram

The system SHALL place the position control above the fretboard diagram so that it stays in place when the diagram changes height.

#### Scenario: The position control keeps its place
- **WHEN** the drawn shape uses more or fewer frets
- **THEN** the position control stays above the diagram without moving

### Requirement: Song content persists with the item

The system SHALL store the chord chart and the tab as optional fields of the repertoire item so they are saved and loaded with it.

#### Scenario: Reloading the app
- **WHEN** the user reopens a song that has a chord chart and a tab
- **THEN** the app shows the stored lyrics with chords and the stored tab

#### Scenario: Editing a saved song
- **WHEN** the user changes the lyrics, the chords or the tab of a saved song
- **THEN** the app saves the change on that same song

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

The system SHALL let the user edit the chord name and SHALL treat it as the source of truth, so the chord finder and the fretboard drawing follow it whenever the name can be decomposed into a root note and a type.

#### Scenario: Typing a recognised chord
- **WHEN** the user types a chord the app can decompose
- **THEN** the chord finder marks it as selected and the drawing updates to match

#### Scenario: Changing a selector
- **WHEN** the user picks a chord in the finder
- **THEN** the name and the drawing update

#### Scenario: An unrecognised name
- **WHEN** the user types a name the app cannot decompose
- **THEN** the finder shows no chord selected and the name is kept as written

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

The system SHALL list the user's saved chords in a clearly marked group separate from the standard chords inside the chord finder, SHALL offer saved chords with no recognised root note in a general group, and SHALL mark the chord as "personalizado" when its shape comes from the user's saved chords.

#### Scenario: Saved chords appear grouped
- **WHEN** the user opens the chord finder
- **THEN** the user's saved chords appear in a marked group after the standard ones

#### Scenario: A saved chord without a root note
- **WHEN** a saved chord has no recognised root note
- **THEN** the app offers it in a general group

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

### Requirement: Drawing a shape names the chord

The system SHALL name the chord drawn on the fretboard when the sounding notes form a chord it knows, and SHALL leave the name unchanged when they do not.

#### Scenario: A drawn chord is named
- **WHEN** the user marks frets and open strings that form a chord the app knows
- **THEN** the app writes that chord's name

#### Scenario: A drawn shape the app does not know
- **WHEN** the drawn notes do not form any chord the app knows
- **THEN** the app leaves the name as it was

#### Scenario: The same notes fit more than one name
- **WHEN** the drawn notes fit more than one chord the app knows
- **THEN** the app names the one whose root is the lowest sounding note

### Requirement: Song content editors start collapsed

The system SHALL present the lyrics-and-chords editor and the tab editor as separate collapsible sections that start collapsed, SHALL let the user expand or collapse each one independently, and SHALL keep the expanded state only for the current session without persisting it with the song.

#### Scenario: Opening a song shows both sections collapsed
- **WHEN** the user opens the detail page of a saved song or the creation form
- **THEN** the lyrics-and-chords section and the tab section both start collapsed and their editors are hidden

#### Scenario: Expanding one section keeps the other closed
- **WHEN** the user expands the tab section
- **THEN** the lyrics-and-chords section stays collapsed

#### Scenario: Collapsing an expanded section
- **WHEN** the user collapses an expanded section
- **THEN** its editor is hidden and the other section keeps its own state

#### Scenario: The expanded state is not persisted
- **WHEN** the user expands a section, leaves the song, and opens it again
- **THEN** both sections start collapsed again
