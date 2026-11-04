# Spec Delta

## MODIFIED Requirements

### Requirement: Techniques come from a closed global catalogue

The system SHALL let the user classify a lick with any combination of techniques from a single global catalogue shared with practice technique blocks — alternate picking, sweep picking, legato, bending, tapping, hybrid picking, economy picking, fingerstyle, rhythm strumming and slide —, SHALL keep a Spanish and an original name for each technique, SHALL NOT accept a technique chosen as free text, SHALL keep the classification optional, and SHALL discard stored techniques outside the catalogue without discarding the lick.

#### Scenario: Choosing several techniques
- **WHEN** the user selects two or more techniques for a lick
- **THEN** the app stores all of them and shows each one with its name according to the technique-name preference

#### Scenario: The catalogue is the only source
- **WHEN** the user classifies a lick
- **THEN** the app offers only the catalogue techniques and no field for a custom label

#### Scenario: Stored labels outside the catalogue
- **WHEN** a stored lick carries a technique the catalogue does not contain
- **THEN** the app drops that technique and keeps the valid ones and the lick

#### Scenario: Technique names are translated
- **WHEN** the user views the licks library with the technique-name preference set to Spanish or to the original name
- **THEN** every technique is named in the chosen form, regardless of the interface language

#### Scenario: The original name is available in Spanish
- **WHEN** the interface is in Spanish and the user chooses original technique names
- **THEN** badges, pickers and analytics show the original names instead of the Spanish ones

#### Scenario: The preference applies to every lick surface
- **WHEN** the user changes the technique-name preference
- **THEN** lick cards, the lick detail, the editor and the technique distribution use the new form
