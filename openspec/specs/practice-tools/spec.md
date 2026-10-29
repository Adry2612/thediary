# practice-tools Specification

## Purpose

Gathers the tools a guitarist uses next to a practice session —metronome, tuner, tone generator and a delay calculator— in one section of the app, so each one is reachable without leaving the workspace and without starting a practice.

## Requirements

### Requirement: Herramientas replaces the metronome screen

The system SHALL offer a tools section at `/tools`, SHALL name it "Herramientas" in the navigation and in its header, SHALL keep the metronome as one of its tools, SHALL show every tool on a single page without a tab selector, SHALL use one column on narrow viewports and two columns from 1280 px, SHALL keep the string block at full width, and SHALL redirect `/metronome` to the section.

#### Scenario: Opening the section
- **WHEN** the user chooses Herramientas in the navigation
- **THEN** the tools section opens with the metronome, tuner, tone generator and calculator visible as separate blocks, with the metronome first

#### Scenario: A wide viewport
- **WHEN** the tools section is shown at 1280 px or wider
- **THEN** the metronome and the tuner share a row, the tone generator and the delay calculator share the next, and the string block keeps the full width

#### Scenario: Switching tools
- **WHEN** the user starts using a different block
- **THEN** that tool changes its own state while the other tools stay visible and keep theirs

#### Scenario: Scrolling the page
- **WHEN** the user scrolls through the tools section
- **THEN** every tool appears in order, each with its own heading, and no tool is hidden behind a selector

#### Scenario: A narrow viewport
- **WHEN** the tools section is shown on a phone or tablet
- **THEN** every tool occupies its own row, in order, without horizontal scrolling, and each keeps its controls reachable

#### Scenario: The old address
- **WHEN** the user opens `/metronome`
- **THEN** the app leads to the tools section instead of showing a not-found page

#### Scenario: Reporting the section
- **WHEN** the user opens the navigation on the tools section
- **THEN** the entry reads "Herramientas" and is marked as the current section

### Requirement: The tuner detects the played note

The tuner SHALL listen to the microphone, SHALL let the user choose a tuning preset and an A4 reference, SHALL show the detected note with its deviation in cents and whether it is in tune, SHALL start listening from its start control without a reload, including on mobile browsers whose audio context starts suspended, SHALL show an error instead of staying idle when audio cannot start, SHALL ask for the microphone only when the tuner is started and SHALL stop listening when the user leaves the tool.

#### Scenario: Tuning a string
- **WHEN** the user starts the tuner and plays a note
- **THEN** the tuner shows the nearest note, the cents of deviation and whether the string is in tune

#### Scenario: Starting on a mobile browser
- **WHEN** the user starts the tuner in a mobile browser that creates its audio context suspended
- **THEN** the tuner resumes audio, reports that it is listening and shows the detected note instead of staying idle

#### Scenario: Choosing a tuning
- **WHEN** the user selects a tuning preset
- **THEN** the tuner lists that preset's strings as the targets instead of the standard ones

#### Scenario: Changing the reference
- **WHEN** the user changes the A4 reference
- **THEN** the detected note and its deviation are recalculated with that reference

#### Scenario: No permission
- **WHEN** the microphone permission is denied or unavailable
- **THEN** the tuner explains the problem and keeps the rest of the tools usable

#### Scenario: Audio cannot start
- **WHEN** the audio context cannot run after the user starts the tuner
- **THEN** the tuner shows an error instead of appearing to listen with no signal

#### Scenario: Leaving the tool
- **WHEN** the user switches to another row or leaves the section
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
