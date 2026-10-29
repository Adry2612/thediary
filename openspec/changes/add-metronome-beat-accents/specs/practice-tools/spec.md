# Spec Delta

## ADDED Requirements

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
