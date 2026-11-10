# display-preferences Specification

## Purpose

Defines the per-device presentation preferences for technique names and tuning labels, and how those preferences apply across licks, practice, repertoire and tools.

## Requirements

### Requirement: Display preferences live in Settings

The system SHALL offer three per-device preferences in Settings: technique names in Spanish or with their original name, tunings by name or by per-string notes, and the first day of the week as Monday or Sunday. It SHALL persist them locally, SHALL apply a change immediately without a reload, and SHALL keep them across reloads.

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
- **WHEN** the user reloads the app after changing any preference
- **THEN** every choice is still applied

#### Scenario: Defaults without a stored preference
- **WHEN** the user has never changed the preferences
- **THEN** technique names follow the interface language, tunings are shown by name and the week starts on Monday

### Requirement: The first day of the week is configurable

The system SHALL let the user choose Monday or Sunday as the first day of the week and SHALL apply it to every calendar and weekly grouping: the annual practice calendar, the weekly practice summary, the weekly routine planner and the weekly intervals of the time and wellbeing charts. The rolling week period SHALL remain the seven days ending today.

#### Scenario: Monday as the first day
- **WHEN** the user chooses Monday
- **THEN** the annual calendar starts its weekday labels with Monday, the weekly summary starts on Monday and the monthly chart groups its intervals from Monday to Sunday

#### Scenario: Sunday as the first day
- **WHEN** the user chooses Sunday
- **THEN** the annual calendar starts its weekday labels with Sunday, the weekly summary starts on Sunday and the monthly chart groups its intervals from Sunday to Saturday

#### Scenario: The preference does not move the rolling week
- **WHEN** the user changes the first day of the week while the week period is selected
- **THEN** the week still covers the seven days ending today

#### Scenario: The routine planner follows the preference
- **WHEN** the user chooses Sunday as the first day
- **THEN** the weekly routine planner lists Sunday before Monday

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

#### Scenario: A translated technique name
- **WHEN** the interface is in Spanish, the user chooses original names and a technique only has a translated name, such as strumming
- **THEN** it is shown in Spanish, while proper names such as sweep picking keep their original form

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
