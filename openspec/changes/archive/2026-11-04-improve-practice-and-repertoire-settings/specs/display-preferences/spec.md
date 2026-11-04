# Spec Delta

## Purpose

Defines the per-device presentation preferences for technique names and tuning labels, and how those preferences apply across licks, practice, repertoire and tools.

## ADDED Requirements

### Requirement: Display preferences live in Settings

The system SHALL offer two per-device preferences in Settings: technique names in Spanish or with their original name, and tunings by name or by per-string notes. It SHALL persist them locally, SHALL apply a change immediately without a reload, and SHALL keep them across reloads.

#### Scenario: Choosing Spanish technique names
- **WHEN** the user chooses Spanish for technique names
- **THEN** every technique label is shown in Spanish, including when the interface is in English

#### Scenario: Choosing original technique names
- **WHEN** the user chooses the original name for techniques
- **THEN** every technique label is shown with its original name, including when the interface is in Spanish

#### Scenario: Choosing tunings by name
- **WHEN** the user chooses tunings by name
- **THEN** a known tuning is shown as its name, such as “Drop D” or “Estándar”

#### Scenario: Choosing tunings by notes
- **WHEN** the user chooses tunings by per-string notes
- **THEN** a known tuning is shown as its notes, such as `DADGBE` or `EADGBE`

#### Scenario: Preferences survive a reload
- **WHEN** the user reloads the app after changing either preference
- **THEN** both choices are still applied

#### Scenario: Defaults without a stored preference
- **WHEN** the user has never changed the preferences
- **THEN** technique names follow the interface language and tunings are shown by name

### Requirement: Technique names follow the display preference

The system SHALL apply the technique-name preference to lick badges, technique pickers, practice block titles, saved-practice details and technique analytics, SHALL resolve a stored name written in either language to the same technique, and SHALL keep a legacy custom name exactly as stored.

#### Scenario: A stored Spanish name shown as original
- **WHEN** a lick or practice block stores “Púa alterna” and the user chooses original names
- **THEN** it is shown as “Alternate picking”

#### Scenario: A stored original name shown in Spanish
- **WHEN** a lick or practice block stores “Alternate picking” and the user chooses Spanish names
- **THEN** it is shown as “Púa alterna”

#### Scenario: A legacy custom name
- **WHEN** a saved technique block carries a name outside the catalogue
- **THEN** it is shown exactly as stored in either preference

#### Scenario: Analytics group both languages
- **WHEN** two practices store the same technique once in Spanish and once in its original name
- **THEN** the technique analytics count them as one technique

### Requirement: Tuning labels follow the display preference

The system SHALL apply the tuning preference wherever a tuning is shown, including repertoire forms, repertoire cards, song details and tuner presets. For a known tuning it SHALL show its localized name or its per-string notes; for an unknown or custom tuning it SHALL show the stored text without inventing a name.

#### Scenario: Drop D by name
- **WHEN** the user chooses names and a song or the tuner uses Drop D
- **THEN** it is shown as “Drop D” in Spanish or “Drop D” in English

#### Scenario: Drop D by notes
- **WHEN** the user chooses notes and a song or the tuner uses Drop D
- **THEN** it is shown as `DADGBE`

#### Scenario: Standard by notes
- **WHEN** the user chooses notes and a song or the tuner uses standard tuning
- **THEN** it is shown as `EADGBE` instead of “Estándar” or “Standard”

#### Scenario: A custom tuning
- **WHEN** a song stores a tuning outside the catalogue
- **THEN** the stored text is shown as it was written, without a guessed name

#### Scenario: The stored value does not change
- **WHEN** the user changes the tuning preference
- **THEN** the tuning stored with the song remains the same value
