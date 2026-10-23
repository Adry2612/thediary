# Spec Delta

## ADDED Requirements

### Requirement: A practice block shows only its own material

The system SHALL show only the study material of the block currently being practised, SHALL include the material of the repertoire item linked to that block, and SHALL NOT show material from any other block.

#### Scenario: The current block has material
- **WHEN** the user is practising a block with attached resources
- **THEN** the practice screen shows that block's resources and no other block's resources

#### Scenario: A linked repertoire item contributes material
- **WHEN** the current block is linked to a song with a Guitar Pro file, files or links
- **THEN** the practice screen includes those materials with the block's own resources

#### Scenario: Moving to another block
- **WHEN** the timer moves to a different block
- **THEN** the material panel replaces the previous block's material with the new block's material

#### Scenario: A block without material
- **WHEN** the current block has no own or linked material
- **THEN** the panel shows an empty state instead of another block's material

#### Scenario: Attaching material during practice
- **WHEN** the user attaches a material while a block is current
- **THEN** the material is added to that block and shown immediately

### Requirement: A repertoire block is linked to a song and named after it

The system SHALL require every repertoire block to reference one song from the repertoire, SHALL take the block's name from that song's title, SHALL NOT allow the user to type a different block name, SHALL keep the song part optional, and SHALL remove the reference when the block changes to another category. The song SHALL be chosen through a searchable picker that offers only songs.

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

### Requirement: A technique block takes its name from the technique catalogue

The system SHALL let the user choose a technique block's name from the predefined technique catalogue through a searchable picker, SHALL NOT accept a newly typed technique name, and SHALL keep a previously stored custom name selectable until the user chooses a catalogue technique.

#### Scenario: Selecting a technique
- **WHEN** the user opens the technique picker and chooses a technique
- **THEN** the block name becomes that technique's name

#### Scenario: Searching the technique catalogue
- **WHEN** the user types part of a technique name in the picker
- **THEN** the picker lists only the catalogue techniques and custom techniques that match

#### Scenario: No technique search results
- **WHEN** the search matches no technique
- **THEN** the picker shows an empty result message and the block keeps its current technique or missing state

#### Scenario: A new technique block needs a technique
- **WHEN** a new technique block has no technique chosen
- **THEN** the routine cannot be saved or started until the user picks one

#### Scenario: A previously stored custom name
- **WHEN** a saved technique block has a name outside the catalogue
- **THEN** that name remains selectable in the search picker until the user chooses a catalogue technique

#### Scenario: No free-text technique
- **WHEN** the block category is technique
- **THEN** the editor offers a button that opens the searchable technique picker instead of a free-text name field or a long select

### Requirement: Block details are called "Detalle del bloque"

The system SHALL present the former exercises section as "Detalle del bloque" in the editor, the running practice and the completed practice, SHALL accept any number of detail entries per block, and SHALL show them in the completed practice's "Qué se practicó" column.

#### Scenario: Adding a detail
- **WHEN** the user adds a detail such as "dos notas por cuerda, ejercicio 4"
- **THEN** the block stores it and shows it as an entry of the block

#### Scenario: No details
- **WHEN** a block has no detail entries
- **THEN** the editor and the completed practice show no detail for that block

#### Scenario: The running practice shows the details
- **WHEN** the current block has detail entries
- **THEN** the practice screen shows them under the block name

#### Scenario: The completed practice shows the details
- **WHEN** the user opens a saved practice
- **THEN** its "Qué se practicó" column lists the detail entries stored with each block

#### Scenario: The details survive a reload
- **WHEN** the user reloads the app after saving a routine with details
- **THEN** the details are still part of the block

### Requirement: A running practice can switch the song of a repertoire block

The system SHALL show a small control beside the current block title while a repertoire block is being practised, SHALL open the searchable song picker from that control, SHALL change that block's song and name and clear its part for the rest of the session, SHALL update the material and artist shown, and SHALL NOT modify the saved routine unless the user accepts the update offer.

#### Scenario: The song control sits beside the block title
- **WHEN** a repertoire block is current
- **THEN** a small icon button appears to the right of the block title and no song select is shown in the timer card

#### Scenario: Switching the song
- **WHEN** the user opens the icon button, searches for another song and chooses it
- **THEN** the block references the new song, its block name becomes the new song title, and its previous part is cleared

#### Scenario: Material and artist update
- **WHEN** the song of the current block changes
- **THEN** the block title, the material panel and the artist under the title show the new song's information

#### Scenario: Other blocks are unaffected
- **WHEN** the user switches the song of one block
- **THEN** every other block keeps its own song, part and material

#### Scenario: The timer keeps running
- **WHEN** the user switches songs during a running practice
- **THEN** the elapsed time and the current block are not reset

#### Scenario: The routine is unchanged by default
- **WHEN** the user switches songs and saves the practice without accepting the routine update
- **THEN** the saved routine keeps its original links

### Requirement: A practice started from a saved routine can update that routine

The system SHALL detect when the links of a practice started from a saved routine differ from the routine, SHALL offer to update the routine when that practice ends, and SHALL update it only when the user accepts.

#### Scenario: Changed links offer an update
- **WHEN** a practice started from a saved routine ends after its song or lick links changed
- **THEN** the completion dialog offers to update that routine

#### Scenario: Accepting the update
- **WHEN** the user accepts the update offer
- **THEN** the routine stores the links used in the practice

#### Scenario: Declining the update
- **WHEN** the user declines the update offer
- **THEN** the routine keeps its previous links

#### Scenario: No changes, no offer
- **WHEN** a practice started from a saved routine ends without link changes
- **THEN** the completion dialog shows no routine update offer

#### Scenario: A quick practice has no routine to update
- **WHEN** a practice not started from a saved routine ends
- **THEN** the completion dialog shows no routine update offer

### Requirement: The timer can continue past a block's planned time

The system SHALL offer an option to keep the timer running after a block's planned time until the user advances to the next block, SHALL keep the block-complete notice visible while it runs overtime, SHALL include the overtime in the session total, and SHALL leave the option off by default.

#### Scenario: The option is off
- **WHEN** a block reaches its planned time with the option off
- **THEN** the timer stops at zero and waits for the user to advance, as before

#### Scenario: The option is on
- **WHEN** a non-final block reaches its planned time with the option on
- **THEN** the timer keeps running in that block and the total keeps increasing

#### Scenario: The notice stays visible
- **WHEN** a block is running overtime
- **THEN** the block-complete notice remains visible until the user advances

#### Scenario: Advancing after overtime
- **WHEN** the user advances to the next block during overtime
- **THEN** the next block starts with its own full planned time

#### Scenario: Pausing during overtime
- **WHEN** the user pauses while a block runs overtime
- **THEN** the timer pauses without advancing the block

#### Scenario: The final block
- **WHEN** the final block reaches its planned time
- **THEN** the practice completes as before instead of entering overtime

#### Scenario: The total includes overtime
- **WHEN** a practice with overtime is saved
- **THEN** its recorded duration and block time include the overtime

### Requirement: A saved practice shows its block details and resolved links

The system SHALL show each saved block's detail entries and SHALL resolve a repertoire link to the song title, with the part when present, and a lick link to the lick title, including when the block names only the item.

#### Scenario: A block linked only to a song
- **WHEN** a saved block names a song but no part
- **THEN** the completed practice shows the song title for that block

#### Scenario: A block linked to a song and a part
- **WHEN** a saved block names a song and a part
- **THEN** the completed practice shows both the song and the part

#### Scenario: A block linked to a lick
- **WHEN** a saved block names a lick
- **THEN** the completed practice shows the lick title for that block

#### Scenario: A block with details
- **WHEN** a saved block has detail entries
- **THEN** the completed practice lists them in the "Qué se practicó" column

## MODIFIED Requirements

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

#### Scenario: The song changes during the practice
- **WHEN** the user switches the block's song while the practice is running
- **THEN** the artist under the block name shows the new song's artist, or disappears when the new song has none
