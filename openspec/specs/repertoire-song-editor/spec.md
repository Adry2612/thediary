# repertoire-song-editor Specification

## Purpose
Lets the user write a song's content by hand in the repertoire: the lyrics with chords placed at any position, the chord shapes and the library they come from, and the tablature with its frets and performance techniques, all editable from the song's page and kept with the item.

## Requirements

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

### Requirement: Tab measures wrap into systems

The system SHALL lay the tab measures out in rows that fill the available width, SHALL continue the measures that do not fit on the next row as a new system, SHALL NOT scroll the tab horizontally, and SHALL label each system with the number of its first measure.

#### Scenario: Measures that do not fit wrap to the next system
- **WHEN** the measures of the tab do not fit the available width
- **THEN** the app continues them on the next row as a new system instead of scrolling horizontally

#### Scenario: The tab never scrolls horizontally
- **WHEN** the tab has more measures than fit in one row
- **THEN** the app provides no horizontal scrolling for the tab and every measure is reachable by scrolling the page vertically

#### Scenario: Each system is labelled with its first measure
- **WHEN** a system is drawn
- **THEN** the app shows the number of its first measure at the start of the system

#### Scenario: Resizing reflows the systems
- **WHEN** the available width changes
- **THEN** the app recomputes how many measures fit per system and redraws the rows

#### Scenario: A note keeps its measure after reflowing
- **WHEN** the systems reflow because the width changed
- **THEN** every note stays on the same string and time position

#### Scenario: Keyboard navigation crosses systems
- **WHEN** the user moves the selected cell past the last column of a system
- **THEN** the app continues the selection on the following system

#### Scenario: Measures added or removed update the systems
- **WHEN** the user adds or removes a measure
- **THEN** the app redraws the systems with the new measure count and keeps the notes that remain inside it

### Requirement: Tab notes store performance techniques

The system SHALL store, for each tab note, the performance techniques applied to it, chosen from legato, slide, bend, vibrato, palm mute, let ring, tapping, harmonic, dead note, tremolo picking, trill, and slap or pop, and SHALL keep that note's techniques attached to it when its fret changes or its column moves.

#### Scenario: A technique is stored with a note
- **WHEN** the user applies a technique to a note
- **THEN** the app stores that technique on that note and keeps it when the note is saved

#### Scenario: Changing the fret keeps the techniques
- **WHEN** the user changes the fret of a note that has techniques
- **THEN** the app keeps those techniques on the note

#### Scenario: Changing the resolution keeps the techniques
- **WHEN** the user changes the resolution of the grid
- **THEN** the app keeps every note's techniques with it

#### Scenario: Removing a note removes its techniques
- **WHEN** the user clears a note that has techniques
- **THEN** the app removes the note together with its techniques

### Requirement: Legato and slide are transitions from a preceding note

The system SHALL store legato (hammer-on or pull-off) and slide (ascending, descending, or position shift) as a property of the destination note that refers to the nearest earlier note on the same string, SHALL not apply either of them when the same string has no earlier note, and SHALL drop a transition whose referenced note no longer exists.

#### Scenario: A hammer-on needs a preceding note
- **WHEN** the user applies a hammer-on to a note whose string has an earlier note
- **THEN** the app stores the hammer-on on that note as a transition from the earlier note

#### Scenario: A pull-off needs a preceding note
- **WHEN** the user applies a pull-off to a note whose string has an earlier note
- **THEN** the app stores the pull-off on that note as a transition from the earlier note

#### Scenario: A slide needs a preceding note
- **WHEN** the user applies an ascending, descending, or position-shift slide to a note whose string has an earlier note
- **THEN** the app stores the slide on that note as a transition from the earlier note

#### Scenario: No preceding note on the string
- **WHEN** the user tries to apply a legato or a slide to a note whose string has no earlier note
- **THEN** the app does not apply it and the note stays unchanged

#### Scenario: The referenced note is removed
- **WHEN** the user removes the earlier note that a legato or slide referred to
- **THEN** the app drops that transition from the following note

#### Scenario: The transition points at the nearest earlier note
- **WHEN** a string has several notes before the destination note
- **THEN** the app links the transition to the closest one in time

### Requirement: Bends and vibrato carry their shape

The system SHALL store a bend as an amount in semitones together with whether it is released and whether it starts from a prebend, and SHALL store vibrato as slight or wide, and SHALL draw each of these distinctly from the others.

#### Scenario: A plain bend
- **WHEN** the user applies a bend of a given number of semitones
- **THEN** the app stores that amount on the note and draws the bend

#### Scenario: A bend that is released
- **WHEN** the user marks the bend as released
- **THEN** the app stores the release with the bend and draws it as a bend-and-release

#### Scenario: A prebend
- **WHEN** the user marks the note as a prebend
- **THEN** the app stores it and draws it as a bend that starts before the note sounds

#### Scenario: A prebend that is released
- **WHEN** the user marks a prebend as released
- **THEN** the app draws it as a prebend-and-release, distinct from the other bends

#### Scenario: Vibrato is slight or wide
- **WHEN** the user applies a slight vibrato and then a wide vibrato
- **THEN** the app stores and draws the two differently

### Requirement: The grid supports selecting a range of cells

The system SHALL let the user select more than one tab cell as a rectangular range, SHALL draw the whole range as selected, and SHALL keep one active cell inside the range for fret entry.

#### Scenario: Dragging selects a range
- **WHEN** the user presses on a cell and drags across other cells
- **THEN** the app selects every cell between the first and the last one

#### Scenario: Shift and a click extends the range
- **WHEN** the user holds Shift and activates another cell
- **THEN** the app extends the selection from the active cell to that cell

#### Scenario: Shift and the arrows extend the range
- **WHEN** the user holds Shift and presses an arrow key
- **THEN** the app extends the selection one cell in that direction and keeps the rest of the range

#### Scenario: A plain click selects a single cell
- **WHEN** the user activates a cell without holding Shift and without dragging
- **THEN** the app selects only that cell

#### Scenario: Moving with the arrows collapses the range
- **WHEN** the user presses an arrow key without holding Shift
- **THEN** the app moves the active cell and the selection becomes only that cell

### Requirement: Techniques are applied to the selected cells

The system SHALL let the user apply and remove each technique on every note of the current selection at once, SHALL reflect whether all, some or none of the selected notes carry each technique, SHALL offer keyboard shortcuts that apply or remove them without leaving the keyboard workflow, and SHALL keep the existing fret entry and navigation shortcuts working.

#### Scenario: Applying to a single cell
- **WHEN** the user activates a technique with a single cell selected
- **THEN** the app applies it to that cell's note and marks it as active

#### Scenario: Applying to several cells at once
- **WHEN** the user activates a technique with several cells selected
- **THEN** the app applies it to every selected note that can take it

#### Scenario: Removing from several cells
- **WHEN** every selected note already carries a technique and the user activates it
- **THEN** the app removes it from all of them and stops marking it as active

#### Scenario: A partial selection completes on activation
- **WHEN** only some of the selected notes carry a technique and the user activates it
- **THEN** the app applies it to the rest so that all of them carry it

#### Scenario: A technique needs a note
- **WHEN** the user activates a technique with cells selected that hold no note
- **THEN** the app applies it only to the cells that hold a note and leaves the rest unchanged

#### Scenario: A transition applies only where it is possible
- **WHEN** the user applies a legato or a slide to a selection in which only some notes have an earlier note on their string
- **THEN** the app applies it to those notes and leaves the others unchanged

#### Scenario: Applying with a keyboard shortcut
- **WHEN** the user presses the shortcut of a technique with cells selected
- **THEN** the app applies or removes that technique on the whole selection without moving it

#### Scenario: Fret entry and navigation still work
- **WHEN** the user types a digit or presses an arrow key on the grid
- **THEN** the app enters the fret on the active cell or moves the selection as before

### Requirement: Techniques are drawn over time, as in a standard tab

The system SHALL draw each applied technique in the shape a standard guitar tablature uses for it, chosen per technique: a span that covers a run of notes, a link between two notes, a mark that lasts over the note it sounds on, a mark on the note, or a replacement of the note head. The system SHALL derive spans and links from the stored per-note techniques and SHALL NOT keep a second copy of them.

#### Scenario: A span technique covers a run of notes
- **WHEN** consecutive notes carry palm mute, let ring, or tremolo picking
- **THEN** the app draws one marker that opens at the first of them, runs across the whole run, and closes after the last one, instead of repeating the mark on every note

#### Scenario: A span breaks at a gap
- **WHEN** a note inside a span does not carry the technique
- **THEN** the app draws two spans, one before the gap and one after it

#### Scenario: A span that crosses two systems
- **WHEN** a span reaches past the end of a system of the wrapped tab
- **THEN** the app draws the part of the span that falls inside each system

#### Scenario: A link technique joins two notes
- **WHEN** a note carries a hammer-on, a pull-off, or a slide
- **THEN** the app draws it as a link that joins that note with the earlier note on the same string it comes from

#### Scenario: A lasting technique extends over the note
- **WHEN** a note carries a bend, a vibrato, or a trill
- **THEN** the app draws a mark that starts on the note and reaches across the time the note sounds

#### Scenario: A point technique marks the note
- **WHEN** a note carries tapping, a harmonic, a slap, or a pop
- **THEN** the app draws its glyph on the note

#### Scenario: A dead note replaces the fret
- **WHEN** a note is marked as dead
- **THEN** the app draws an `x` where the fret number would go

#### Scenario: Several techniques on one note
- **WHEN** a note has more than one technique applied
- **THEN** the app draws all of them, each in its own shape, without hiding the note's fret

#### Scenario: The legend explains the techniques
- **WHEN** the user opens the technique legend
- **THEN** the app lists each technique with the name and the shape it is drawn with

### Requirement: Saved tabs without techniques keep loading

The system SHALL load a stored tab that predates techniques without changing its notes, and SHALL discard only the technique values it cannot understand while keeping the note's string, fret, and column.

#### Scenario: A tab saved before techniques
- **WHEN** the app loads a tab whose notes have no techniques
- **THEN** it loads every note exactly as stored

#### Scenario: An unknown technique value
- **WHEN** a stored note carries a technique value the app does not recognise
- **THEN** it drops that value and keeps the note

#### Scenario: An out-of-range bend amount
- **WHEN** a stored bend has an amount outside the accepted range
- **THEN** the app discards that bend and keeps the note
