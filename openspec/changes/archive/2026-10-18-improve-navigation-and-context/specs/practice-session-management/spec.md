# Spec Delta

## ADDED Requirements

### Requirement: A running practice shows the artist of the block's song

While a practice is running, the system SHALL show, under the name of the block being practiced, the artist of the repertoire item that block is linked to, and SHALL show nothing there when the block is not linked to an item or when that item has no artist.

#### Scenario: Practicing a block linked to an item with an artist
- **WHEN** the block being practiced is linked to a repertoire item that has an artist
- **THEN** the artist appears under the name of the block

#### Scenario: The item has no artist
- **WHEN** the block being practiced is linked to a repertoire item without an artist
- **THEN** nothing appears under the name of the block

#### Scenario: The block does not belong to the repertoire
- **WHEN** the block being practiced is not linked to a repertoire item
- **THEN** nothing appears under the name of the block
