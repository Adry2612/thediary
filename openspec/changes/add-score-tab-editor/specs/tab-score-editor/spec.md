# Spec Delta

## Purpose

Lets the user write and edit a guitar tablature as a score of bars and timed beats, with rhythm, rests, ties and playing techniques, hear it played back, and read it wherever the app shows a saved tab, in the repertoire songs and in the licks.

## ADDED Requirements

### Requirement: A tab is a score of bars made of timed beats

The system SHALL store a tab as an ordered list of bars, each holding timed beats, where a beat has a duration and is either a rest or holds notes on the strings of the item's tuning, and SHALL allow between 1 and 64 bars.

#### Scenario: A new tab
- **WHEN** the user opens the editor for an item that has no tab
- **THEN** the tab starts with one 4/4 bar holding a whole-bar rest

#### Scenario: Several notes in one beat
- **WHEN** the user writes frets on different strings of the same beat
- **THEN** the beat holds all those notes and they sound together

#### Scenario: The item's tuning is respected
- **WHEN** the item has a tuning
- **THEN** the strings of the tab are labelled with the notes of that tuning

#### Scenario: Reaching the bar limit
- **WHEN** the tab already has 64 bars and the user tries to add another
- **THEN** the app does not add it and tells the user the limit has been reached

### Requirement: A bar that does not fill its time signature is flagged

The system SHALL compare the total length of each bar's beats with its time signature, SHALL mark a bar whose beats add up to more or less, SHALL keep that bar editable and saveable, and SHALL NOT change any beat to make it fit.

#### Scenario: Shortening a note
- **WHEN** the user shortens a beat so the bar adds up to less than its time signature
- **THEN** the bar is marked as incomplete and the other beats keep their durations

#### Scenario: Overfilling a bar
- **WHEN** the beats of a bar add up to more than its time signature
- **THEN** the bar is marked as overfull

#### Scenario: Fixing the bar
- **WHEN** the user edits the bar until its beats add up to its time signature
- **THEN** the mark disappears

#### Scenario: The mark does not rely on colour
- **WHEN** a bar is flagged
- **THEN** the mark is a shape with a text description available to assistive technology, not only a colour

#### Scenario: Saving a flagged bar
- **WHEN** the user saves an item whose tab has a flagged bar
- **THEN** the app saves the tab as it is

### Requirement: The tab is drawn as tablature with its rhythm

The system SHALL draw the tab as the item's strings with the rhythm of every beat under them, the number of each bar and the tempo mark, SHALL draw every note, rest, tie and technique the tab can hold, and SHALL let the user add standard notation above the tablature.

#### Scenario: Default view
- **WHEN** a tab is shown
- **THEN** it shows the strings, the frets, the rhythm under them, the bar numbers and the tempo mark

#### Scenario: Adding standard notation
- **WHEN** the user turns on standard notation
- **THEN** the same notes are also drawn on a staff above the tablature, and turning it off hides the staff

#### Scenario: An empty bar
- **WHEN** a bar holds only a rest
- **THEN** the bar shows that rest instead of being blank

### Requirement: Bars wrap into systems without horizontal scrolling

The system SHALL lay the bars out in rows that fill the available width, SHALL continue the bars that do not fit on a new row, SHALL NOT scroll the tab horizontally and SHALL show the number of the first bar of each row.

#### Scenario: Bars that do not fit
- **WHEN** the bars of the tab do not fit the available width
- **THEN** the app continues them on the next row instead of scrolling horizontally

#### Scenario: Resizing reflows the rows
- **WHEN** the available width changes
- **THEN** the app recomputes how many bars fit per row and every note keeps its string, fret and place in its bar

#### Scenario: Each row is labelled
- **WHEN** a row is drawn
- **THEN** it shows the number of its first bar

### Requirement: A note or a beat can be selected and kept in view

The system SHALL let the user select a note or a beat by clicking or tapping it, SHALL mark the selection with an outline and a background rather than colour alone, SHALL move it with the arrow keys between beats, strings and bars, SHALL extend it to a range of beats with Shift, and SHALL keep it in view while it moves.

#### Scenario: Selecting a note
- **WHEN** the user clicks a note
- **THEN** that note is selected and highlighted

#### Scenario: Selecting a rest or an empty position
- **WHEN** the user clicks a rest or an empty position of a beat
- **THEN** that beat is selected on the string nearest to the click

#### Scenario: Moving across bars
- **WHEN** the user presses the right arrow on the last beat of a bar
- **THEN** the selection moves to the first beat of the next bar, continuing on the next row if needed

#### Scenario: Extending a range
- **WHEN** the user presses Shift with an arrow key
- **THEN** the selection grows to cover the beats between its start and the new position

#### Scenario: The selection survives an edit
- **WHEN** the user edits the selected note
- **THEN** the same note stays selected after the tab is redrawn

#### Scenario: Clearing the selection
- **WHEN** the user presses Escape with a selection and no palette open
- **THEN** the selection is cleared

### Requirement: Typing a fret writes the note

The system SHALL write the typed fret, from 0 to 24, on the selected string of the selected beat using that beat's duration, SHALL accept two digits, SHALL turn a rest into a note, and SHALL NOT accept a fret above 24.

#### Scenario: Writing a note on a rest
- **WHEN** the user selects a rest and types 5
- **THEN** the beat becomes a note at fret 5 on the selected string

#### Scenario: Changing a fret
- **WHEN** the user selects a note and types 7
- **THEN** the note becomes fret 7 and keeps its techniques

#### Scenario: Two-digit fret
- **WHEN** the user types 1 and then 2 in quick succession
- **THEN** the note becomes fret 12

#### Scenario: A fret out of range
- **WHEN** the typed digits would make a fret above 24
- **THEN** the app keeps the last valid fret and does not change the note

#### Scenario: Adding a note to a chord
- **WHEN** the user selects another string of a beat that already has a note and types a fret
- **THEN** the beat holds both notes

### Requirement: The duration of a beat can be set from whole to sixty-fourth

The system SHALL let the user set the duration of the selected beats from a whole note to a sixty-fourth note, with an optional dot or as a triplet, and SHALL change only the durations of the selected beats.

#### Scenario: Setting a duration
- **WHEN** the user picks an eighth note for the selected beat
- **THEN** that beat becomes an eighth and no other beat changes

#### Scenario: Dotted and triplet values
- **WHEN** the user turns on the dot or the triplet for the selected beat
- **THEN** the beat is drawn and played with the dotted or triplet length

#### Scenario: A range of beats
- **WHEN** several beats are selected and the user picks a duration
- **THEN** every selected beat takes that duration

#### Scenario: The bar no longer adds up
- **WHEN** the new duration makes the bar add up to more or less than its time signature
- **THEN** the bar is flagged and nothing else is rearranged

### Requirement: A beat can be split to make room for another one

The system SHALL let the user split the selected beat into two beats of half its duration, SHALL keep the current content in the first beat, SHALL make the second beat a rest, SHALL select the new beat, and SHALL keep the bar's total length unchanged.

#### Scenario: Splitting a note in a full bar
- **WHEN** the user splits a quarter note in a full 4/4 bar
- **THEN** the bar holds the same note as an eighth followed by an eighth rest, and the new rest is selected

#### Scenario: Splitting a rest
- **WHEN** the user splits a rest
- **THEN** both halves are rests and the second one is selected

#### Scenario: Dotted and triplet beats
- **WHEN** the user splits a dotted or triplet beat
- **THEN** both halves keep the dot or the triplet and together last exactly as long as the original

#### Scenario: A beat that cannot be split
- **WHEN** the beat is already a sixty-fourth note or the bar already holds the maximum number of beats
- **THEN** the option is disabled and the palette says why

#### Scenario: Undoing a split
- **WHEN** the user undoes a split
- **THEN** the two beats become the original beat again

### Requirement: Rests and ties can be set on a beat

The system SHALL let the user turn the selected beats into rests, SHALL let the user tie the selected note to the previous note on the same string, and SHALL remove a tie whose source note no longer exists.

#### Scenario: Turning a note into a rest
- **WHEN** the user turns the selected beat into a rest
- **THEN** the beat keeps its duration and its notes are removed

#### Scenario: Tying a note
- **WHEN** the user ties the selected note and the previous beat has a note on the same string
- **THEN** the note is drawn and played as a continuation of the previous note

#### Scenario: Nothing to tie to
- **WHEN** the previous beat has no note on the selected string
- **THEN** the tie option is unavailable and the palette says why

#### Scenario: The source note is deleted
- **WHEN** the user deletes the note a tie continues
- **THEN** the tie is removed and the tied note stays as a normal note

### Requirement: Bars, time signature and tempo can be edited

The system SHALL let the user add a bar after the last one, insert one before or after the selection, duplicate and delete the selected bar, change the time signature from a bar onward and set the tempo from a bar onward, and SHALL keep at least one bar.

#### Scenario: Adding a bar
- **WHEN** the user adds a bar
- **THEN** the bar uses the time signature in force and holds a whole-bar rest

#### Scenario: Duplicating a bar
- **WHEN** the user duplicates the selected bar
- **THEN** a copy with the same beats and notes appears right after it

#### Scenario: Changing the time signature
- **WHEN** the user sets 3/4 on a bar
- **THEN** that bar and the following bars use 3/4 until another change, and any bar whose beats no longer fit is flagged

#### Scenario: Setting the tempo
- **WHEN** the user sets a tempo on a bar
- **THEN** the tempo mark appears at that bar and playback uses it from there

#### Scenario: Deleting the last remaining bar
- **WHEN** the tab has one bar and the user deletes it
- **THEN** the bar is emptied to a whole-bar rest instead of being removed

### Requirement: A floating palette offers the actions for the selection

The system SHALL show a palette next to the selection with the durations, rest, tie, techniques and bar actions that apply, SHALL mark the options already active in the selection, SHALL disable an option that cannot apply and say why, and SHALL close without changing anything when the user presses Escape.

#### Scenario: Opening the palette
- **WHEN** the user selects a note or a beat
- **THEN** the palette is available next to the selection without covering it

#### Scenario: Showing what is active
- **WHEN** the selected note is a dotted eighth with palm mute
- **THEN** the dot, the eighth and the palm mute options are marked as active

#### Scenario: An option that cannot apply
- **WHEN** an option cannot apply to the selection, such as a hammer-on with no previous note
- **THEN** it is disabled and a short text explains what is missing

#### Scenario: Closing the palette
- **WHEN** the user presses Escape with the palette open
- **THEN** the palette closes and the selection and the tab stay as they were

### Requirement: The palette is made of icons with a visible description

The system SHALL show every palette option as an icon, SHALL describe the option under the pointer or keyboard focus with its name, its shortcut and the reason it is unavailable, SHALL keep the full name as the accessible name of the button, and SHALL keep the description available on touch, where there is no hover.

#### Scenario: Hovering an option
- **WHEN** the user points at the eighth-note icon
- **THEN** a description with its name and shortcut appears next to the icon

#### Scenario: Focusing an option with the keyboard
- **WHEN** the user moves the palette focus to an icon
- **THEN** the same description appears and is announced with the option

#### Scenario: An unavailable option
- **WHEN** the user hovers an option that cannot apply
- **THEN** the description says why instead of only dimming the icon

#### Scenario: Touch
- **WHEN** the user opens the palette on a touch device
- **THEN** the description of the touched option is visible inside the sheet without needing to hover

### Requirement: The editor includes an interactive tutorial

The system SHALL offer a tutorial button that opens a step-by-step guide over the editor itself, SHALL highlight the area each step uses, SHALL advance when the user actually performs the action, SHALL let the user skip a step or close the tutorial at any time, and SHALL keep the score and the editor usable while the guide is open.

#### Scenario: Starting the tutorial
- **WHEN** the user presses the tutorial button
- **THEN** a card explains the first step and the part of the editor it uses is highlighted

#### Scenario: Advancing by doing
- **WHEN** the user performs the action the step asks for, such as writing a fret
- **THEN** the guide moves to the next step without needing another button

#### Scenario: Already written notes do not count
- **WHEN** the tutorial starts on a score that already has notes
- **THEN** the guide waits for a new action instead of skipping steps on its own

#### Scenario: Skipping a step
- **WHEN** the user presses the skip-step button
- **THEN** the guide moves on without undoing anything

#### Scenario: Closing the tutorial
- **WHEN** the user presses Escape or the close button
- **THEN** the guide closes and the notes written during it stay in the score

#### Scenario: Keyboard only
- **WHEN** the user opens and follows the tutorial with the keyboard
- **THEN** every step can be read, skipped and closed without a pointer

### Requirement: Notes carry performance techniques

The system SHALL let the user apply to the selected notes any combination of the techniques below, each toggled independently, and SHALL keep a note's techniques when its fret changes.

- Legato: hammer-on, pull-off
- Slide: up, down, to position
- Bend: amount, release, pre-bend
- Vibrato: slight, wide
- Palm mute, let ring, tapping
- Harmonic: natural, artificial, pinch, tap
- Dead note, ghost note, tremolo picking, trill
- Slap, pop
- Accent: normal, heavy

#### Scenario: Applying a technique to a range
- **WHEN** several notes are selected and the user applies palm mute
- **THEN** every selected note has palm mute and the option shows as active

#### Scenario: A technique that depends on a previous note
- **WHEN** the user applies a hammer-on or a slide into a note with no previous note on its string
- **THEN** the option is unavailable and the palette says why

#### Scenario: A bend amount
- **WHEN** the user applies a bend
- **THEN** the user can choose its amount from 1/4 up to 2 semitones, and its release or pre-bend

#### Scenario: Changing the fret keeps the techniques
- **WHEN** the user changes the fret of a note that has techniques
- **THEN** the note keeps those techniques

#### Scenario: A ghost note
- **WHEN** the user marks a note as ghost
- **THEN** the note is drawn in parentheses and played softly

### Requirement: Every edit can be undone and redone

The system SHALL let the user undo and redo every edit made in the current editing session, SHALL keep at least the last 100 edits, SHALL count a two-digit fret as one edit, and SHALL discard the history when the editor closes.

#### Scenario: Undoing an edit
- **WHEN** the user undoes the last edit
- **THEN** the tab returns to its state before that edit and the selection is restored

#### Scenario: Redoing an edit
- **WHEN** the user redoes an undone edit
- **THEN** the edit is applied again

#### Scenario: A new edit after undoing
- **WHEN** the user makes a new edit after undoing
- **THEN** the undone edits can no longer be redone

#### Scenario: Closing the editor
- **WHEN** the user closes the editor and opens it again
- **THEN** there is nothing to undo

### Requirement: Notes, beats and bars can be copied, cut, pasted and deleted

The system SHALL let the user copy, cut and paste the selected beats or bars, within a tab and between tabs in the same session, and SHALL let the user delete the selected note, beat or bar as separate actions.

#### Scenario: Copying beats
- **WHEN** the user copies selected beats and pastes at another beat
- **THEN** the copied beats are inserted there with their notes, durations and techniques

#### Scenario: Pasting between tabs
- **WHEN** the user copies bars in one tab and pastes them in another tab in the same session
- **THEN** the bars appear in the second tab

#### Scenario: Deleting a note
- **WHEN** the user deletes the selected note and it was the only one in its beat
- **THEN** the beat becomes a rest with the same duration

#### Scenario: Deleting a beat
- **WHEN** the user deletes the selected beat
- **THEN** the beat is removed, and the bar is flagged if it no longer adds up

#### Scenario: Deleting a bar
- **WHEN** the user deletes the selected bar
- **THEN** the bar and its beats are removed and the following bars move up

### Requirement: The tab plays with sound from the start or from the selection

The system SHALL play the tab with an acoustic guitar sound from the first bar or from the selection, SHALL follow the playback with a cursor kept in view, SHALL let the user change the playback speed without changing the saved tempo, and SHALL load the sound data only when the user first asks for sound.

#### Scenario: Playing from the start
- **WHEN** the user presses play with nothing selected
- **THEN** the tab plays from the first bar and a cursor follows the beat being played

#### Scenario: Playing from the selection
- **WHEN** the user presses play with a beat selected
- **THEN** the tab plays from that beat

#### Scenario: Changing the speed
- **WHEN** the user lowers the playback speed
- **THEN** the tab plays slower and the saved tempo does not change

#### Scenario: The sound loads on demand
- **WHEN** a tab is shown or edited and the user has not asked for sound
- **THEN** no sound data is downloaded

#### Scenario: The sound cannot be loaded
- **WHEN** the sound data fails to load
- **THEN** the app tells the user and the tab stays viewable and editable

#### Scenario: Hearing notes while editing
- **WHEN** the user turns on hearing notes and writes or selects a note
- **THEN** the pitch of that note sounds once

### Requirement: Tabs in the earlier grid format open as scores

The system SHALL open a tab stored in the earlier grid format as a score that keeps every note's string, fret, place in time and techniques, SHALL give each note the duration up to the next note in its bar, SHALL fill the rest of each bar with rests, SHALL leave the stored grid tab untouched, and SHALL discard only the technique values it does not recognise.

#### Scenario: Opening a grid tab
- **WHEN** the user opens an item whose tab is in the grid format
- **THEN** the editor shows a score with the same notes on the same strings and frets, in the same order

#### Scenario: Durations are derived
- **WHEN** a grid has a note on the first column of a bar and the next note three columns later
- **THEN** the first note lasts those three columns and the bar holds no other beat between them

#### Scenario: An empty bar
- **WHEN** a grid bar has no notes
- **THEN** it opens as a bar with a whole-bar rest

#### Scenario: Techniques are preserved
- **WHEN** a grid note has a bend, a vibrato or a slide
- **THEN** the score note keeps it

#### Scenario: An unknown technique value
- **WHEN** a stored note carries a technique value the app does not recognise
- **THEN** it drops that value and keeps the note

#### Scenario: The grid tab is kept
- **WHEN** the user edits and saves the score
- **THEN** the item stores the score and keeps the grid tab unchanged

#### Scenario: Legacy plain text
- **WHEN** a lick has only the earlier plain-text tablature
- **THEN** the app keeps showing that text and does not convert it automatically

### Requirement: A saved tab is shown read-only wherever the app lists it

The system SHALL show a saved tab drawn as in the editor, without editing controls, on the lick cards, the lick detail and the song page, SHALL offer playback only on the lick detail and the song page, and SHALL show the text alternative of the tab while it is loading or if drawing fails.

#### Scenario: Lick card
- **WHEN** a lick with a tab appears on its card
- **THEN** the tab is drawn read-only and the card offers no playback

#### Scenario: Lick detail
- **WHEN** the user opens a lick with a tab
- **THEN** the tab is drawn read-only with the playback controls

#### Scenario: During practice
- **WHEN** the practice screen shows the lick of a Lick block
- **THEN** the tab is drawn read-only and no play, metronome or synthesis control is offered for it

#### Scenario: The drawing is not ready
- **WHEN** the tab is still being drawn or cannot be drawn
- **THEN** the text alternative of the tab is shown instead of an empty area

### Requirement: The editor works without a pointer and is announced to assistive technology

The system SHALL let the user do every edit with the keyboard alone, SHALL announce the bar, beat, string, fret and duration of the selection when it changes, and SHALL provide the text alternative of the tab to assistive technology.

#### Scenario: Writing a note with the keyboard
- **WHEN** the user moves the selection with the arrow keys and types a fret
- **THEN** the note is written without using a pointer

#### Scenario: Announcing the selection
- **WHEN** the selection moves to another beat
- **THEN** assistive technology is told its bar, beat, string, fret and duration

#### Scenario: Visible focus
- **WHEN** the editor has keyboard focus
- **THEN** the selection and the focused control have a visible outline

#### Scenario: Text alternative
- **WHEN** assistive technology reads the tab
- **THEN** it finds the bars with their beats, notes and techniques as text

### Requirement: The editor fits small screens and touch

The system SHALL keep the editor inside the app's horizontal rhythm on small screens, SHALL show the palette as a bottom sheet with a fret keypad when the pointer is touch, and SHALL keep every control at least as large as the app's touch target size.

#### Scenario: The editor on a phone
- **WHEN** the editor is shown at a phone width
- **THEN** it keeps the page margin, its controls wrap without being cut off and the page does not scroll horizontally

#### Scenario: The palette on touch
- **WHEN** the user taps a note on a touch device
- **THEN** the palette opens as a bottom sheet that does not hide the selected beat, with a row of frets from 0 to 24

#### Scenario: The editor on its own screen
- **WHEN** the user opens the editor on a phone
- **THEN** the page keeps the app's side margin and the editor uses the full width of the content column

### Requirement: A note menu opens where the note is

The system SHALL select a beat and a string from a double-click, a right-click or a long press anywhere inside the tab, SHALL open the palette anchored to that position, and SHALL let the user choose the duration and techniques from that menu without using the Options button.

#### Scenario: Double-clicking a note
- **WHEN** the user double-clicks a note
- **THEN** that note is selected and its palette opens next to it

#### Scenario: Right-clicking an empty position
- **WHEN** the user right-clicks an empty beat or string
- **THEN** that position is selected and the palette opens, ready to set its duration or write a fret

#### Scenario: Long-pressing on touch
- **WHEN** the user presses and holds a note on a touch device
- **THEN** the bottom sheet opens for that note without activating any option when the finger lifts

#### Scenario: Choosing the duration from the note
- **WHEN** the user picks a duration from the note menu
- **THEN** that duration is applied to the selected note and the menu stays open for more changes
