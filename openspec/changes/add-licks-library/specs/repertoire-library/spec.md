# Spec Delta

## ADDED Requirements

### Requirement: The repertoire holds songs only

The system SHALL create, list and edit only songs in the repertoire, SHALL offer no option to add a lick there, and SHALL keep licks in their own library.

#### Scenario: Creating an item in the repertoire
- **WHEN** the user opens the repertoire creation page
- **THEN** the form offers no lick type and saves the item as a song

#### Scenario: Filtering the repertoire
- **WHEN** the user opens the repertoire list filters
- **THEN** the filters describe songs and other song attributes, not licks or their techniques

#### Scenario: A repertoire without licks
- **WHEN** the user opens the repertoire list
- **THEN** no lick is listed, even after licks have been saved in the licks library

## REMOVED Requirements

### Requirement: The type label is singular and steps aside when the list is filtered by type

**Reason**: The repertoire no longer holds two types of item, so there is no type label to show or hide; licks moved to their own library with their own navigation and filters.

**Migration**: Every repertoire item of kind lick becomes a lick in the licks library, preserving its title and converting its tablature to plain text. Existing songs keep their label "Canción" without a type filter.
