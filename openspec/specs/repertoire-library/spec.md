# repertoire-library Specification

## Purpose
Lists the pieces the user practices and describes each one with what they need to choose it: its difficulty, the practice time actually spent on it, and the type it belongs to.

## Requirements

### Requirement: An item carries its difficulty

The system SHALL let the user choose, when creating or editing an item, one of three difficulties — beginner, intermediate, or advanced —, SHALL keep the choice optional so an item without one stays valid, SHALL show the chosen difficulty with the item, and SHALL keep it when any other field of the item changes.

#### Scenario: Choosing a difficulty when creating
- **WHEN** the user picks a difficulty while creating an item
- **THEN** the app stores it with the item and shows it in the library

#### Scenario: Changing it later
- **WHEN** the user changes the difficulty of a saved item
- **THEN** the app stores the new value

#### Scenario: A difficulty is optional
- **WHEN** the user does not pick a difficulty
- **THEN** the item is saved without one and shows none

#### Scenario: The difficulty survives other edits
- **WHEN** the user changes the title, the artist, or any other field of an item that has a difficulty
- **THEN** the app keeps the difficulty

### Requirement: The type label is singular and steps aside when the list is filtered by type

The system SHALL label each item with its type in the singular — "Canción" for a song and "Lick" for a lick —, and SHALL hide that label while the list is filtered by a single type.

#### Scenario: A song shows the singular label
- **WHEN** the list shows a song
- **THEN** the item is labelled "Canción", not "Canciones"

#### Scenario: Filtering by songs hides the label
- **WHEN** the user filters the list by songs
- **THEN** the items no longer show their type label

#### Scenario: Filtering by licks hides the label
- **WHEN** the user filters the list by licks
- **THEN** the items no longer show their type label

#### Scenario: Showing every type brings the label back
- **WHEN** the user filters by all types
- **THEN** each item shows its type label again

### Requirement: The practice time of an item is the time practiced on it

The system SHALL count, for each item, the time of every completed practice phase linked to that item, whether or not the phase also names one of its parts, SHALL show that time on the item, SHALL add it to the library total, SHALL order the library by it, and SHALL link the item when a practice is started directly from it.

#### Scenario: A phase linked to the item and to a part counts
- **WHEN** a completed phase names an item and one of its parts
- **THEN** its time counts for that item and for that part

#### Scenario: A phase linked only to the item counts
- **WHEN** a completed phase names an item but no part
- **THEN** its time counts for that item

#### Scenario: A phase with no item link does not count
- **WHEN** a completed phase names no item
- **THEN** its time counts for no item

#### Scenario: Starting a practice from an item links it
- **WHEN** the user starts a practice directly from an item
- **THEN** the phase that practice creates names that item, so the time will count when the practice is completed

#### Scenario: The library total adds up
- **WHEN** the items hold practice time
- **THEN** the library total is the sum of those times

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

### Requirement: The repertoire header offers adding an item

The repertoire SHALL show "Añadir nuevo elemento" as its main header action, linking to the page that creates a repertoire item, and SHALL NOT show a "Preparar práctica" action or a separate block that repeats the add action with descriptive text.

#### Scenario: Header action
- **WHEN** the user opens the repertoire
- **THEN** the header shows an "Añadir nuevo elemento" action that opens the new-item page

#### Scenario: No practice shortcut in the header
- **WHEN** the user opens the repertoire
- **THEN** no "Preparar práctica" action appears in the repertoire header

#### Scenario: No duplicate add block
- **WHEN** the repertoire page renders
- **THEN** the add action appears only in the header, without a second block above the saved items that repeats it and explains how to fill the form

#### Scenario: Rest of the repertoire stays unchanged
- **WHEN** the header action changes
- **THEN** the summary, rankings, search, filters and saved items keep their content and position
