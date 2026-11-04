# Spec Delta

## ADDED Requirements

### Requirement: A string change records the set that was mounted

The system SHALL let the user record a string change with its date and the set mounted, SHALL offer a catalogue of sets grouped by guitar family —eléctrica, acústica y española— with brand, model and gauges, SHALL accept a set typed by hand, and SHALL allow saving the change without specifying any set.

#### Scenario: Choosing a set from the catalogue
- **WHEN** the user opens a string change and picks a model
- **THEN** the brand, the model and its six gauges are shown before saving

#### Scenario: Filtering by family
- **WHEN** the user switches between eléctrica, acústica and española
- **THEN** the list shows only the sets of that family, each with its gauges

#### Scenario: A set typed by hand
- **WHEN** the user chooses the free option
- **THEN** they can write the brand, the model and the gauges, and that is what is saved

#### Scenario: No set
- **WHEN** the user saves the change without choosing a set
- **THEN** the change is recorded with its date and no set

#### Scenario: The catalogue needs no connection
- **WHEN** the app is offline
- **THEN** the catalogue is still available, because it ships with the app

### Requirement: The mounted set is kept with the change

The system SHALL store a copy of the mounted set with the history entry, SHALL show it in the history and in the change form, and SHALL keep showing it even if the model is later removed from the catalogue.

#### Scenario: Reading the history
- **WHEN** the user opens the history of a guitar
- **THEN** each string change shows the set that was mounted, with its gauges

#### Scenario: A retired model
- **WHEN** a stored set no longer exists in the catalogue
- **THEN** the history still shows its brand, model and gauges

#### Scenario: Older entries
- **WHEN** an entry was saved before this change
- **THEN** it keeps showing its date and notes, without a set
