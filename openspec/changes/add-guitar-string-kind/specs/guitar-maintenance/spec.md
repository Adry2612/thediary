# Spec Delta

## ADDED Requirements

### Requirement: A guitar remembers its string type

The system SHALL let the user set a string type of electric, acoustic or classical on each guitar, SHALL store it with the guitar, and SHALL use it as the starting type when a string change is recorded.

#### Scenario: Setting the type
- **WHEN** the user adds or edits a guitar and picks a string type
- **THEN** the type is saved with the guitar and appears selected the next time the form opens

#### Scenario: A type already known
- **WHEN** the user records a string change on a guitar that has a type
- **THEN** the set list shows only that type of strings, without asking again

#### Scenario: A guitar without a type
- **WHEN** the user records a string change on a guitar that has no type
- **THEN** the form shows the type selector so it can be chosen

#### Scenario: Remembering the first choice
- **WHEN** the user records a string change on a guitar that had no type and saves it
- **THEN** the chosen type is stored on the guitar and the next change no longer shows the selector

#### Scenario: An invalid stored type
- **WHEN** a stored guitar has a type the app does not know
- **THEN** the type is discarded and the guitar is treated as having none

### Requirement: The string-change form only asks for the date and the set

The string-change form SHALL ask for the date and the mounted set, SHALL hide the type selector when the guitar already has a type, and SHALL NOT offer a free-text field.

#### Scenario: A short form
- **WHEN** the user opens the string-change form for a guitar with a known type
- **THEN** the form shows the date, the set picker and the save action only

#### Scenario: No free-text details
- **WHEN** the user opens the string-change form
- **THEN** there is no details field, and the note can still be written later from the history

#### Scenario: Custom set
- **WHEN** the user picks a set that is not in the catalogue
- **THEN** the brand, model and gauges are still asked for, and the type comes from the guitar
