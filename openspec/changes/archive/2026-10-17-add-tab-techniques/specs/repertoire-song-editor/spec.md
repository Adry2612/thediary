# Spec Delta

## ADDED Requirements

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
