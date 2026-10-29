# Spec Delta

## Purpose

Gathers the tools a guitarist uses next to a practice session —metronome, tuner, tone generator and a delay calculator— in one section of the app, so each one is reachable without leaving the workspace and without starting a practice.

## ADDED Requirements

### Requirement: Herramientas replaces the metronome screen

The system SHALL offer a tools section at `/tools`, SHALL name it "Herramientas" in the navigation and in its header, SHALL keep the metronome as one of its tools, SHALL show one tool at a time with an accessible selector, and SHALL redirect `/metronome` to the new section.

#### Scenario: Opening the section
- **WHEN** the user chooses Herramientas in the navigation
- **THEN** the tools section opens with its four tools and the metronome selected

#### Scenario: Switching tools
- **WHEN** the user chooses another tool
- **THEN** only that tool's panel is shown and the selector reports which one is active

#### Scenario: The old address
- **WHEN** the user opens `/metronome`
- **THEN** the app leads to the tools section instead of showing a not-found page

#### Scenario: Reporting the section
- **WHEN** the user opens the navigation on the tools section
- **THEN** the entry reads "Herramientas" and is marked as the current section

### Requirement: The tuner detects the played note

The tuner SHALL listen to the microphone, SHALL let the user choose a tuning preset and an A4 reference, SHALL show the detected note with its deviation in cents and whether it is in tune, SHALL ask for the microphone only when the tuner is started and SHALL stop listening when the user leaves the tool.

#### Scenario: Tuning a string
- **WHEN** the user starts the tuner and plays a note
- **THEN** the tuner shows the nearest note, the cents of deviation and whether the string is in tune

#### Scenario: Choosing a tuning
- **WHEN** the user selects a tuning preset
- **THEN** the tuner lists that preset's strings as the targets instead of the standard ones

#### Scenario: Changing the reference
- **WHEN** the user changes the A4 reference
- **THEN** the detected note and its deviation are recalculated with that reference

#### Scenario: No permission
- **WHEN** the microphone permission is denied or unavailable
- **THEN** the tuner explains the problem and keeps the rest of the tools usable

#### Scenario: Leaving the tool
- **WHEN** the user switches to another tool or leaves the section
- **THEN** the tuner stops using the microphone

### Requirement: The tone generator plays a sustained tone

The tone generator SHALL play a sustained sine tone at a frequency the user chooses between the audible limits, SHALL show the equivalent musical note, SHALL let the user set the level, SHALL stop the tone when the user leaves the tool and SHALL keep the tone independent of the metronome.

#### Scenario: Starting a tone
- **WHEN** the user starts the generator at a frequency
- **THEN** the tone sounds continuously and the panel shows the frequency and its note

#### Scenario: Changing the frequency
- **WHEN** the user changes the frequency while the tone plays
- **THEN** the tone changes to the new frequency without stopping

#### Scenario: Stopping
- **WHEN** the user stops the generator or leaves the tool
- **THEN** the tone stops and the audio context is released

### Requirement: The delay calculator converts tempo to milliseconds

The calculator SHALL convert a BPM value into the milliseconds of a beat and of the common note divisions, SHALL include dotted and triplet values, SHALL update the results as the tempo changes and SHALL round them to two decimals.

#### Scenario: Reading the divisions
- **WHEN** the user enters a tempo
- **THEN** the calculator lists the milliseconds for the whole beat and for each offered division, including dotted and triplet variants

#### Scenario: Updating the tempo
- **WHEN** the user changes the tempo
- **THEN** every value recomputes without reloading the tool

#### Scenario: Result precision
- **WHEN** a division does not produce a whole number of milliseconds
- **THEN** the value is shown with two decimals

#### Scenario: Invalid tempo
- **WHEN** the tempo is empty, zero or outside the accepted range
- **THEN** the calculator explains the valid range instead of showing invalid values
