# Spec Delta

## ADDED Requirements

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
