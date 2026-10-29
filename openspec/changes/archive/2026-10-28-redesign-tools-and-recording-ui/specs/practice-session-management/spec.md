# Spec Delta

## ADDED Requirements

### Requirement: A saved take is navigated on its waveform

The system SHALL let the user move the playback of a saved take by tapping or dragging on its waveform, SHALL draw the playhead on that waveform, SHALL expose the waveform as a keyboard-operable slider, SHALL keep the fixed-step rewind and forward controls, and MUST NOT show a separate progress bar for that take.

#### Scenario: Tapping the waveform
- **WHEN** the user taps a point of the waveform
- **THEN** playback moves to the position that corresponds to that point and the playhead stays there

#### Scenario: Dragging the waveform
- **WHEN** the user drags across the waveform
- **THEN** the playback position follows the pointer while it moves and stops at the released point

#### Scenario: Seeking with the keyboard
- **WHEN** the waveform has focus and the user presses an arrow, Home or End key
- **THEN** the position moves by a short step or to the start or end, and the new position and time are announced

#### Scenario: Playback follows the waveform
- **WHEN** a take is playing
- **THEN** the playhead advances over the waveform and stays in sync with the audio

#### Scenario: No separate progress bar
- **WHEN** a saved take is shown with its waveform
- **THEN** the separate progress bar is absent and the time labels stay visible

### Requirement: The recording transport sits beside the recording name

The recorder SHALL place its transport controls next to the recording-name field on the same row when there is room, SHALL place them directly below the field on narrow viewports, SHALL keep the framed wave display and the recorder status visible, and SHALL keep each control's disabled state and accessible name.

#### Scenario: A wide recorder
- **WHEN** the recorder is shown on a wide viewport
- **THEN** the recording-name field and the transport controls share a row, with the buttons to the right of the name

#### Scenario: A narrow recorder
- **WHEN** the recorder is shown on a phone
- **THEN** the transport moves below the recording-name field without overlapping the wave display

#### Scenario: Recording state
- **WHEN** a recording is in progress
- **THEN** the record control is unavailable, stop is available and the playback controls stay disabled until a take exists

### Requirement: Feedback preferences are read when the practice closes

The system SHALL read the mood and focus preferences when the practice completion sheet opens, so a change made in Settings applies to the next finished practice without reloading the app, SHALL ask only for the metrics enabled at that moment, and SHALL save with empty metrics when they are unanswered.

#### Scenario: Enabling a metric during a practice
- **WHEN** the user enables mood while a practice is running and then finishes it
- **THEN** the completion sheet asks for mood without needing a reload

#### Scenario: Disabling a metric during a practice
- **WHEN** the user disables focus while a practice is running and then finishes it
- **THEN** the completion sheet does not ask for focus

#### Scenario: Answering after the change
- **WHEN** the user answers an enabled metric in the completion sheet
- **THEN** the stored practice keeps that value and the other metric stays empty

#### Scenario: Skipping after the change
- **WHEN** the user saves the practice without answering an enabled metric
- **THEN** the practice is stored and that metric stays empty
