# Spec Delta

## MODIFIED Requirements

### Requirement: A saved practice records the guitar type used

The system SHALL let the user choose electric or acoustic guitar for a practice session, SHALL offer that choice while the practice runs, in manual practice entry and in the session editor, and SHALL store the chosen type with the session. A quick practice started from a repertoire item that declares a guitar type SHALL start from that type. Otherwise the type SHALL come from the last used type or stay unset, and the system SHALL never invent one.

#### Scenario: Choosing the guitar while practising
- **WHEN** the user selects electric or acoustic in a running practice
- **THEN** the session uses that type and the saved practice stores it

#### Scenario: Changing the guitar during the session
- **WHEN** the user changes the guitar type before finishing the practice
- **THEN** the saved practice stores the last chosen type for the whole session

#### Scenario: Choosing the guitar while preparing
- **WHEN** the user selects electric or acoustic in the practice plan
- **THEN** the session uses that type and the saved practice stores it

#### Scenario: A quick practice from a repertoire item
- **WHEN** the user starts a quick practice from a repertoire item that declares a guitar type
- **THEN** the session starts with that type and the saved practice stores it

#### Scenario: A quick practice from an item without a type
- **WHEN** the item declares no guitar type and the user has a last used type
- **THEN** the session starts from the last used type and the saved practice keeps it

#### Scenario: Manual practice
- **WHEN** the user records a practice manually and chooses a guitar type
- **THEN** the saved practice stores that type

#### Scenario: Editing a saved practice
- **WHEN** the user edits a saved practice and changes its guitar type
- **THEN** the practice stores the new type and the dashboard balance uses it

#### Scenario: Clearing the guitar type
- **WHEN** the user chooses not to specify the guitar type in the session editor
- **THEN** the practice keeps no guitar type and counts as unclassified

#### Scenario: Practice from before this change
- **WHEN** a stored practice has no guitar type
- **THEN** it loads normally and remains unclassified instead of receiving an invented type

#### Scenario: Last used type
- **WHEN** the user starts a new practice that does not declare a guitar type after having chosen one before
- **THEN** the choice starts on the last used type and the user can change it

#### Scenario: Stored type survives reload and sync
- **WHEN** a practice with a guitar type is reloaded or merged from another device
- **THEN** the type is preserved, and an invalid stored value is discarded without losing the practice
