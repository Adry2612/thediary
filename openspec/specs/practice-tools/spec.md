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

The tuner SHALL listen to the microphone, SHALL let the user choose a tuning preset and an A4 reference, SHALL label the preset according to the tuning-display preference, SHALL show the detected note with its deviation in cents and whether it is in tune, SHALL start listening from its start control without a reload, including on mobile browsers whose audio context starts suspended, SHALL show an error instead of staying idle when audio cannot start, SHALL ask for the microphone only when the tuner is started and SHALL stop listening when the user leaves the tool.

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

#### Scenario: The preset label follows the preference
- **WHEN** the user changes the tuning-display preference
- **THEN** the preset labels show the tuning name or its per-string notes according to the choice

#### Scenario: The preset strings do not change
- **WHEN** the user changes the tuning-display preference
- **THEN** the notes the tuner listens for stay the same

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

### Requirement: Each beat cycles through four states from its dot

The metronome SHALL let the user cycle any beat's dot through normal, open accent, closed accent and muted on each activation, applying the change immediately instead of waiting for a second activation. A beat SHALL hold exactly one of the four states at a time.

#### Scenario: First activation
- **WHEN** the user activates a normal beat dot
- **THEN** that beat becomes an open accent and the click that follows rings

#### Scenario: Second activation
- **WHEN** the user activates an open accented beat dot
- **THEN** that beat becomes a closed accent and the click that follows is choked

#### Scenario: Third activation
- **WHEN** the user activates a closed accented beat dot
- **THEN** that beat becomes muted and stops sounding

#### Scenario: Fourth activation
- **WHEN** the user activates a muted beat dot
- **THEN** that beat returns to the normal click

#### Scenario: An immediate change
- **WHEN** the user activates a beat dot once
- **THEN** the state changes at once, without waiting for a second activation

#### Scenario: One state at a time
- **WHEN** a beat changes state
- **THEN** it holds exactly one of the four states and never two at once

### Requirement: The beat pattern is remembered per meter

The system SHALL store the state pattern of each meter on the device, SHALL restore it when the metronome is mounted again, and SHALL use the open accent on the first beat as the default for a meter with no stored pattern.

#### Scenario: Coming back to the metronome
- **WHEN** the user leaves the tools screen or reloads the app and returns to the metronome
- **THEN** the meter shows the pattern the user had set

#### Scenario: Switching meter
- **WHEN** the user changes the meter and later returns to the previous one
- **THEN** each meter keeps its own pattern instead of inheriting the other

#### Scenario: First use
- **WHEN** a meter has no stored pattern
- **THEN** its first beat is an open accent and the rest are normal

#### Scenario: A stored pattern that no longer fits
- **WHEN** a stored pattern has a different number of beats than the meter
- **THEN** the metronome ignores the invalid positions and keeps the beats it can map

### Requirement: The closed accent is a tenth higher and choked

The system SHALL play an open accent with the voice's accent tone and its full decay, SHALL play a closed accent a tenth above the open accent with the decay cut to 40 ms, SHALL skip the click of a muted beat while keeping its visual pulse and its beat number, and SHALL keep the normal tone for the remaining beats and their subdivisions.

#### Scenario: An open accent
- **WHEN** an open accented beat sounds
- **THEN** it uses the accent tone and is left to ring

#### Scenario: A closed accent
- **WHEN** a closed accented beat sounds
- **THEN** it sounds a tenth higher than the open accent and stops within 40 ms

#### Scenario: A muted beat
- **WHEN** a beat is muted and the metronome runs
- **THEN** no click is heard on that beat and its dot still pulses in time

#### Scenario: Subdivisions of a muted beat
- **WHEN** a muted beat has subdivisions
- **THEN** none of its subdivisions sound

#### Scenario: Subdivisions of an accented beat
- **WHEN** an accented beat has subdivisions
- **THEN** its subdivisions keep the normal tone

### Requirement: The beat dots are operable and announced

The beat dots SHALL announce their state in words, SHALL be reachable in order with the keyboard, and SHALL let both the accent and the mute be applied without a pointer.

#### Scenario: Keyboard
- **WHEN** a beat dot has focus and the user presses Enter or Space
- **THEN** its state cycles, and pressing M mutes or restores it directly

#### Scenario: Screen reader
- **WHEN** a screen reader reaches a beat dot
- **THEN** it announces the beat number and whether it is normal, an open accent, a closed accent or muted

#### Scenario: No hover required
- **WHEN** the user manages the beats on a touch screen
- **THEN** both actions are available without hovering

### Requirement: The beat row stays centred with any meter

The beat dots SHALL stay centred in the card with any meter, including the ones with fewer than four beats, instead of hugging the left edge.

#### Scenario: A meter with two beats
- **WHEN** the user changes to 6/8 or 6/4
- **THEN** the two dots are centred in the card

#### Scenario: A meter with three beats
- **WHEN** the user changes to 9/8 or 9/4
- **THEN** the three dots are centred in the card

#### Scenario: A meter with four beats
- **WHEN** the user changes to 4/4, 12/8 or 12/4
- **THEN** the four dots are centred in the card

### Requirement: The metronome offers several click voices

The metronome SHALL let the user choose one of seven click voices — a clean synthetic click, woodblock, bell, hi-hat, beep, rimshot and shaker — SHALL use the chosen voice on every beat, and SHALL remember the choice on the device.

#### Scenario: Choosing a voice
- **WHEN** the user picks a voice in the metronome settings
- **THEN** the following beats sound with that voice and the previous one is no longer heard

#### Scenario: Every beat uses the chosen voice
- **WHEN** a voice is selected and the metronome runs
- **THEN** every beat and every subdivision uses that voice instead of the default click

#### Scenario: Default voice
- **WHEN** the user has never chosen a voice
- **THEN** the metronome uses the clean synthetic click

#### Scenario: Remembering the choice
- **WHEN** the user leaves the metronome or reloads the app and comes back
- **THEN** the voice they chose is still selected

#### Scenario: Choosing a voice while running
- **WHEN** the user changes the voice while the metronome is running
- **THEN** the following beats use the new voice without stopping or restarting the metronome

#### Scenario: Recognising the instrument
- **WHEN** the user listens to the woodblock, the bell or the hi-hat
- **THEN** each sounds like that instrument rather than like a plain tone or a noise burst, and the bell sounds like a bell rather than a telephone ring

### Requirement: Each voice has an accent variant

Every voice SHALL provide a normal variant and a clearly noticeable accent variant —louder and brighter, never a subtle variation—, SHALL sound the accent variant on accented beats, SHALL sound the normal variant on the remaining beats and their subdivisions, and SHALL stay silent on muted beats.

#### Scenario: An accented beat
- **WHEN** a beat is accented
- **THEN** it sounds with the accent variant of the chosen voice, which is clearly louder and brighter than its normal variant

#### Scenario: Telling an accent apart
- **WHEN** the user compares an accent variant with the normal variant of the same voice
- **THEN** the accent is clearly louder and never sounds the same as the normal one

#### Scenario: A normal beat
- **WHEN** a beat is not accented
- **THEN** it and its subdivisions sound with the normal variant of the chosen voice

#### Scenario: A muted beat
- **WHEN** a beat is muted
- **THEN** neither its accent nor its normal variant sounds, whatever voice is selected

#### Scenario: Changing the voice keeps the pattern
- **WHEN** the user changes the voice after setting accents and mutes
- **THEN** the pattern stays as it was and only the timbre changes

### Requirement: The audio tools resume when the app returns to the foreground

The system SHALL resume the sound of the metronome, the tone generator and the tuner when the app comes back to the foreground while that tool is playing, SHALL continue the metronome at its current tempo without replaying the beats that were missed, and SHALL offer an explicit action when the browser needs a user gesture to start audio again.

#### Scenario: The metronome keeps sounding after coming back

- **WHEN** the metronome is running, the user switches apps or locks the screen and then returns
- **THEN** the metronome sounds again at the same tempo, subdivision and measure it had

#### Scenario: No burst of missed beats

- **WHEN** the metronome resumes after the app was in the background
- **THEN** it plays one beat at a time from the moment of return, without a run of clicks for the beats that were missed

#### Scenario: The metronome of a running practice

- **WHEN** the metronome of a running practice comes back after the app was in the background
- **THEN** it behaves the same as the metronome of the tools section

#### Scenario: The tone generator comes back

- **WHEN** the tone generator is playing and the app comes back to the foreground
- **THEN** the tone sounds again at the frequency and level it had

#### Scenario: The tuner comes back

- **WHEN** the tuner is listening and the app comes back to the foreground
- **THEN** it resumes listening and shows the detected note again

#### Scenario: The browser needs a gesture

- **WHEN** the browser does not resume audio without a user gesture
- **THEN** the tool offers a visible action to start the sound again, and activating it resumes the tool instead of leaving it silent

#### Scenario: The tool was not running

- **WHEN** the app comes back to the foreground and no audio tool was playing
- **THEN** nothing starts on its own
