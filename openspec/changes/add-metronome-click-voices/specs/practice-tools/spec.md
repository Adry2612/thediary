# Spec Delta

## ADDED Requirements

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
