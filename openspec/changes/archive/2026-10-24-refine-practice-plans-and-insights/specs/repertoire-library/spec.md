# Spec Delta

## ADDED Requirements

### Requirement: The library ranks artists by practised time

The system SHALL show a "most practiced artists" ranking in the repertoire that groups the time of completed phases linked to repertoire songs by the song's artist, sorts the groups from most to least practised, and shows at most five artists with their practised time and song count. The ranking SHALL be derived from existing history, SHALL require no manual favourite mark, and SHALL NOT add storage.

#### Scenario: Ranking by time
- **WHEN** one artist's songs hold more practised time than another's
- **THEN** the artist with more time appears first

#### Scenario: Several songs by one artist
- **WHEN** the user has practised two songs by the same artist
- **THEN** the artist appears once with both songs' time added together

#### Scenario: Same name with different case or spacing
- **WHEN** songs store the same artist name with different capitalisation or surrounding spaces
- **THEN** they appear as one artist in the ranking

#### Scenario: Only songs
- **WHEN** an item is a lick or a phase is not linked to a repertoire item
- **THEN** its time does not enter the artist ranking

#### Scenario: Songs without an artist
- **WHEN** a song has no artist name
- **THEN** its practised time is excluded instead of appearing under an empty artist

#### Scenario: A deleted song
- **WHEN** a phase refers to a repertoire item that no longer exists
- **THEN** its time cannot be attributed and is excluded

#### Scenario: Ties
- **WHEN** two artists have the same practised time
- **THEN** they keep a stable alphabetical order by name

#### Scenario: Top five
- **WHEN** more than five artists have practised time
- **THEN** the ranking shows the five with the most time and no others

#### Scenario: No artist data
- **WHEN** no repertoire song with an artist has practised time
- **THEN** the repertoire shows no artist ranking

#### Scenario: The ranking follows new practice
- **WHEN** the user completes a practice linked to one of an artist's songs
- **THEN** that artist's time and position update without any manual favourite action
