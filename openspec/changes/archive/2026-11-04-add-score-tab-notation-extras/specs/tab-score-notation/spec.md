# Spec Delta

## Purpose

Lets the user mark a tablature with the expression and structure marks of a written song — dynamics, repeats, sections, text, chord diagrams, stroke directions, grace notes and fermatas — and hear them respected when the tab is played back.

## ADDED Requirements

### Requirement: A beat can carry a dynamic

The system SHALL let the user set a dynamic of pp, p, mp, mf, f or ff on the selected beat, SHALL draw it under the beat, SHALL keep it in force until the next dynamic, and SHALL play the beats with the matching loudness.

#### Scenario: Setting a dynamic
- **WHEN** the user sets mf on a beat
- **THEN** the mark mf is drawn under that beat and the active option shows as selected in the palette

#### Scenario: The dynamic stays in force
- **WHEN** a beat has f and the following beats have no dynamic
- **THEN** the following beats play at the loudness of f until another dynamic appears

#### Scenario: Removing a dynamic
- **WHEN** the user clears the dynamic of a beat
- **THEN** the mark disappears and that beat plays at the loudness in force before it

#### Scenario: A dynamic on a range
- **WHEN** several beats are selected and the user sets a dynamic
- **THEN** the dynamic is set on the first selected beat only

### Requirement: A range of beats can crescendo or decrescendo

The system SHALL let the user mark the selected beats as a crescendo or a decrescendo, SHALL draw it as a hairpin across them, and SHALL play those beats getting gradually louder or softer.

#### Scenario: Marking a crescendo
- **WHEN** the user selects four beats and applies crescendo
- **THEN** a hairpin opening to the right spans those four beats

#### Scenario: Playing a crescendo
- **WHEN** the tab is played through a crescendo
- **THEN** the loudness grows gradually across the marked beats

#### Scenario: Removing the mark
- **WHEN** the user clears the mark from part of the span
- **THEN** only the beats still marked keep the hairpin

### Requirement: Bars can open and close repeats

The system SHALL let the user mark a bar as the start of a repeat and a bar as its end with the number of times to play, SHALL draw the repeat signs, SHALL play the repeated bars that many times, and SHALL treat a repeat end with no start as repeating from the first bar.

#### Scenario: A repeated section
- **WHEN** a repeat starts at bar 3 and ends at bar 4 with 2 times
- **THEN** playback plays bars 3 and 4 twice before continuing

#### Scenario: Repeat signs are drawn
- **WHEN** a repeat is set
- **THEN** the opening and closing signs are drawn at the edges of the bars, with the count when it is more than two

#### Scenario: An end with no start
- **WHEN** a bar closes a repeat and no bar opens one before it
- **THEN** playback repeats from the first bar of the tab

#### Scenario: Removing a repeat
- **WHEN** the user removes a repeat mark
- **THEN** its signs disappear and the bars play once

### Requirement: Repeats can have alternate endings

The system SHALL let the user mark the bars of a repeat as played only on chosen passes, SHALL draw those bars under a numbered bracket, and SHALL play each ending only on its passes.

#### Scenario: First and second endings
- **WHEN** bar 5 is marked for the first pass and bar 6 for the second pass of a repeat
- **THEN** each bar is drawn under its numbered bracket and playback plays bar 5 on the first pass and bar 6 on the second

#### Scenario: An ending outside a repeat
- **WHEN** the user marks an ending on a bar that is not inside a repeat
- **THEN** the option is unavailable and the palette says why

### Requirement: A bar can carry a section name

The system SHALL let the user give a bar a section name of up to 30 characters, SHALL draw it above the bar, and SHALL let the user remove it.

#### Scenario: Naming a section
- **WHEN** the user names bar 1 "Intro"
- **THEN** "Intro" is drawn above bar 1

#### Scenario: A name that is too long
- **WHEN** the user types more than 30 characters
- **THEN** the field stops accepting characters at 30

#### Scenario: Removing the name
- **WHEN** the user clears the name
- **THEN** the label disappears

### Requirement: A beat can carry free text

The system SHALL let the user attach a text of up to 40 characters to a beat, SHALL draw it above the beat, and SHALL include it in the text alternative of the tab.

#### Scenario: Adding a text
- **WHEN** the user types "let it ring" for the selected beat
- **THEN** the text is drawn above that beat

#### Scenario: Reading the text without sight
- **WHEN** assistive technology reads the tab
- **THEN** it finds the text at its beat

### Requirement: A beat can show a chord diagram

The system SHALL let the user attach a chord name to a beat, SHALL draw the name above it, SHALL show the chord's diagram when the name matches a chord of the chord library, and SHALL NOT change the notes of the beat.

#### Scenario: A known chord
- **WHEN** the user attaches "Em" to a beat and the chord library has Em
- **THEN** the name and its diagram are shown for that beat

#### Scenario: An unknown name
- **WHEN** the user attaches a name that is not in the chord library
- **THEN** only the name is shown above the beat and no diagram is drawn

#### Scenario: The notes stay as written
- **WHEN** a chord name is attached to a beat
- **THEN** the notes of the beat are unchanged

### Requirement: A beat can mark the stroke direction and a strum

The system SHALL let the user mark a beat with a down stroke, an up stroke or a rasgueado, SHALL draw the mark with the beat, and SHALL play a down or up stroke as the strings sounding one after another in that direction.

#### Scenario: A down stroke
- **WHEN** the user marks a beat with several notes as a down stroke
- **THEN** the mark is drawn and the notes sound from the lowest to the highest string

#### Scenario: An up stroke
- **WHEN** the user marks the beat as an up stroke
- **THEN** the notes sound from the highest to the lowest string

#### Scenario: A stroke on a single note
- **WHEN** the selected beat has one note
- **THEN** the stroke options are unavailable and the palette says a stroke needs more than one note

### Requirement: A beat can have grace notes

The system SHALL let the user add to a beat with a note a grace note with its own fret, played either before the beat or on the beat, SHALL draw it as a small note, and SHALL NOT add one to a rest.

#### Scenario: A grace note before the beat
- **WHEN** the user adds a grace note at fret 2 before the beat
- **THEN** a small note is drawn before the beat and played just ahead of it

#### Scenario: A grace note on a rest
- **WHEN** the selected beat is a rest and the user tries to add a grace note
- **THEN** the option is unavailable and the palette says a grace note cannot be added to an empty note

#### Scenario: Removing a grace note
- **WHEN** the user removes the grace note
- **THEN** the small note disappears and the beat keeps its own note

### Requirement: A beat can have a fermata

The system SHALL let the user mark a beat with a fermata, SHALL draw it above the beat, and SHALL play that beat held longer than its written duration.

#### Scenario: Adding a fermata
- **WHEN** the user marks a beat with a fermata
- **THEN** the sign is drawn above it and playback holds the beat longer

#### Scenario: Removing a fermata
- **WHEN** the user removes it
- **THEN** the beat plays at its written duration

### Requirement: A pickup bar is not flagged as incomplete

The system SHALL let the user mark the first bar as a pickup bar, SHALL NOT flag that bar when its beats add up to less than its time signature, and SHALL still flag it when its beats add up to more.

#### Scenario: A short pickup bar
- **WHEN** the first bar is marked as a pickup and holds a single quarter note in 4/4
- **THEN** the bar is not flagged

#### Scenario: Overfilling a pickup bar
- **WHEN** a pickup bar holds more than its time signature
- **THEN** the bar is flagged as overfull

#### Scenario: A pickup on a later bar
- **WHEN** the selected bar is not the first
- **THEN** the pickup option is unavailable

### Requirement: Marks survive editing and earlier scores keep loading

The system SHALL keep the marks of a beat or a bar through copy, cut, paste, undo and redo, SHALL remove them with the beat or bar they belong to, and SHALL open a score saved before these marks existed unchanged.

#### Scenario: Copying a marked beat
- **WHEN** the user copies a beat with a dynamic and a text and pastes it elsewhere
- **THEN** the pasted beat has the same dynamic and text

#### Scenario: Deleting a marked bar
- **WHEN** the user deletes a bar that has a section name and a repeat start
- **THEN** both marks are removed with it

#### Scenario: Undoing a mark
- **WHEN** the user undoes the last edit after adding a fermata
- **THEN** the fermata is removed

#### Scenario: A score saved without marks
- **WHEN** the app loads a score that has none of these marks
- **THEN** it opens exactly as saved

#### Scenario: An unknown mark value
- **WHEN** a stored beat carries a mark value the app does not recognise
- **THEN** it drops that value and keeps the beat and its notes
