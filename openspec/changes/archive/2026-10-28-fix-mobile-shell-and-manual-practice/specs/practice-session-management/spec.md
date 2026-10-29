# Spec Delta

## MODIFIED Requirements

### Requirement: A repertoire block is linked to a song and named after it

The system SHALL require every repertoire block of a practice plan to reference one song from the repertoire, SHALL take the block's name from that song's title, SHALL NOT allow the user to type a different block name, SHALL keep the song part optional, and SHALL remove the reference when the block changes to another category. The song SHALL be chosen through a searchable picker that offers only songs.

#### Scenario: Choosing a song
- **WHEN** the user selects a song for a repertoire block
- **THEN** the block stores the song, takes the song title as its name, and offers its parts as an optional choice

#### Scenario: Searching for a song
- **WHEN** the user types a title, an artist or a part name in the song picker
- **THEN** the picker lists only songs whose title, artist or parts match the search

#### Scenario: No search results
- **WHEN** the search matches no song
- **THEN** the picker shows an empty result message and the block keeps its current song or missing-link state

#### Scenario: The block name follows the song
- **WHEN** a repertoire block is linked to a song
- **THEN** its name is the song title in the editor, the plan table, the running practice and the saved practice, even if a previous name was different

#### Scenario: The part is optional
- **WHEN** the user links a song but chooses no part
- **THEN** the block is valid and the practice counts its time for the song

#### Scenario: Only songs are offered
- **WHEN** the user opens the song picker of a repertoire block
- **THEN** the app lists repertoire songs and no licks

#### Scenario: A repertoire block without a link cannot start
- **WHEN** a repertoire block has no song selected
- **THEN** the routine cannot be saved or started and the block shows the missing link

#### Scenario: Changing the category clears the song
- **WHEN** a repertoire block is changed to another category
- **THEN** its song and part references are removed

#### Scenario: The stored song disappears
- **WHEN** a routine references a song that no longer exists
- **THEN** the editor shows the missing reference and requires another song before the routine can start

## ADDED Requirements

### Requirement: A manually recorded practice can credit a repertoire song

The system SHALL offer the repertoire song search on the blocks of a manually recorded practice that are of the repertoire category, SHALL let the user save the practice with or without a linked song, SHALL take the block's name from the chosen song, and SHALL count that block's time towards the linked song.

#### Scenario: Opening the song search
- **WHEN** the user registers a past practice and sets a block to the repertoire category
- **THEN** the block offers the same searchable song picker used by the practice plan, and searching by title, artist or part filters the songs

#### Scenario: Linking a song
- **WHEN** the user chooses a song for a manual block
- **THEN** the block takes the song title as its name and stores the song and its optional part

#### Scenario: Saving without a song
- **WHEN** the user saves a manual practice with a repertoire block that has no song
- **THEN** the block keeps the typed name and the practice is saved

#### Scenario: Crediting the song
- **WHEN** a manual practice block is linked to a song
- **THEN** the repertoire shown in the app counts that block's time and parts as practice of that song

#### Scenario: Changing the category
- **WHEN** the user changes a linked manual block to another category
- **THEN** the song reference is removed and the typed name stays editable

#### Scenario: The chosen song disappears
- **WHEN** a manual practice block references a song that no longer exists
- **THEN** the saved practice still loads and keeps the name it stored

#### Scenario: Editing the saved practice
- **WHEN** the user edits a manually recorded practice in the session editor and saves it
- **THEN** the song and part links of its blocks are preserved
