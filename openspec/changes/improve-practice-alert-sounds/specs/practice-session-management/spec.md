# Spec Delta

## ADDED Requirements

### Requirement: The practice alerts are two synthesized instruments

The system SHALL offer exactly two practice alerts —madera y marimba—, SHALL synthesize each one with Web Audio from a recipe of partials and, optionally, filtered noise, and SHALL NOT bundle audio files for them. Both alerts SHALL appear in the start row and in the end row.

#### Scenario: Choosing the start alert
- **WHEN** the user picks a sound in the start row
- **THEN** that sound is heard as a preview and the row marks it as the chosen one

#### Scenario: Choosing the end alert
- **WHEN** the user picks a sound in the end row
- **THEN** the end variant of that sound is heard as a preview and the row marks it as the chosen one

#### Scenario: Both sounds in both rows
- **WHEN** the user opens the sound settings
- **THEN** madera and marimba appear in the start row and in the end row

#### Scenario: The catalogue names are translated
- **WHEN** the interface is in English
- **THEN** the two alerts are named in English

#### Scenario: Telling the alerts apart
- **WHEN** the user compares madera and marimba
- **THEN** each sounds like a different instrument, with its own attack and its own notes

#### Scenario: No audio files
- **WHEN** the app is built
- **THEN** the practice alerts need no audio file to play

### Requirement: The alert choice is previewed and remembered

The system SHALL play an alert as a preview when the user chooses it, SHALL remember the start and end choices on the device, SHALL default to madera at the start and marimba at the end, and SHALL fall back to those defaults when a stored value no longer exists.

#### Scenario: The choice is remembered
- **WHEN** the user reloads the app or leaves the practice screen and comes back
- **THEN** the start and end alerts are still the ones they chose

#### Scenario: Defaults
- **WHEN** the user has never chosen an alert
- **THEN** a block starts with madera and ends with marimba

#### Scenario: A retired choice falls back
- **WHEN** the stored alert is a value that no longer exists
- **THEN** the start falls back to madera and the end to marimba

#### Scenario: The alerts fire at their moments
- **WHEN** a block starts, advances or reaches its end, or the session target is reached
- **THEN** the matching alert is played once

### Requirement: The start is two strikes and the end three

The system SHALL play the start alert as two strikes of the chosen sound in less than one second, and the end alert as three strikes of the same sound, leaving the last one to ring out so the end always lasts longer than the start. The start call SHALL be distinct from the first two strikes of the end melody.

#### Scenario: The start call
- **WHEN** a block starts
- **THEN** two strikes of the chosen sound are heard in order and the alert lasts less than one second

#### Scenario: The end melody
- **WHEN** a block or the target ends
- **THEN** three strikes are heard in order and the last one is left to decay, making the alert longer than the start

#### Scenario: The start is its own call
- **WHEN** the same sound is used to start and to end a block
- **THEN** the start strikes do not repeat the first two of the end melody

#### Scenario: The end alert is noticed over music
- **WHEN** a block reaches its planned time with a backing track playing
- **THEN** the end alert is noticed without looking at the screen

#### Scenario: The end alert is one alert
- **WHEN** the end alert starts
- **THEN** it plays its three strikes once and stops, without looping or waiting to be dismissed
