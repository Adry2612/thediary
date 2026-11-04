# Spec Delta

## MODIFIED Requirements

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
