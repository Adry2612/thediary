# Spec Delta

## ADDED Requirements

### Requirement: A running practice survives the app being suspended

The system SHALL store the running timer's state —elapsed time, current block, time per block, time per skill, whether it is running and when it last advanced— together with the active practice session, SHALL restore it when the app is reopened or reloaded instead of starting from zero, and SHALL count the time that passed while it was running in the background.

#### Scenario: Reloading the app in the middle of a practice

- **WHEN** the user reloads or reopens the app while a practice is running
- **THEN** the practice comes back with the elapsed time and the current block it had, and the timer keeps running from there

#### Scenario: Returning after the phone was locked

- **WHEN** the device suspends the app because the screen was locked and the user comes back
- **THEN** the practice keeps the time practised and the current block instead of restarting at zero

#### Scenario: A paused practice

- **WHEN** the user paused the timer before leaving and comes back later
- **THEN** the practice is still paused with the same elapsed time, and the time spent away is not counted

#### Scenario: The target was reached while away

- **WHEN** the practice comes back and the time practised already reached the session target
- **THEN** the practice reports the target as reached instead of continuing to count

#### Scenario: The plan changed since the stored state

- **WHEN** the stored timer does not belong to the current practice or its blocks no longer match
- **THEN** the stored timer is discarded and the practice starts from the beginning of its current plan

#### Scenario: No stored timer

- **WHEN** the user opens a practice that has never run
- **THEN** the timer starts at zero with its first block, as before

#### Scenario: Leaving the practice

- **WHEN** the user finishes or discards the practice
- **THEN** the stored timer is removed and the next practice does not inherit it

### Requirement: The screen stays awake while a practice runs

The system SHALL ask the device to keep the screen on while the timer is running and the app is in the foreground, SHALL ask again whenever the app returns to the foreground with the timer still running, SHALL release that request when the timer pauses, when the practice finishes and when the user leaves it, and SHALL keep the practice working where the device does not offer it.

#### Scenario: Practising without touching the phone

- **WHEN** the user starts a practice and does not touch the device for several minutes
- **THEN** the screen stays on for as long as the timer runs

#### Scenario: Leaving and coming back

- **WHEN** the user switches to another app and returns while the timer is still running
- **THEN** the request to keep the screen on is made again

#### Scenario: Pausing the practice

- **WHEN** the user pauses the timer
- **THEN** the request is released and the device may lock its screen normally

#### Scenario: Finishing the practice

- **WHEN** the practice is completed or saved
- **THEN** the request is released

#### Scenario: A browser without the feature

- **WHEN** the browser does not offer a way to keep the screen on
- **THEN** the practice runs normally, without an error or a notice

#### Scenario: The device refuses the request

- **WHEN** the device denies the request to keep the screen on
- **THEN** the practice keeps running and no error is shown
