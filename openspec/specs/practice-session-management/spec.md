# practice-session-management Specification

## Purpose
Permite practicar de dos maneras —retomar una rutina guardada o lanzar una práctica rápida libre con cronómetro— y gestionar después las sesiones del historial consultándolas, editándolas y eliminándolas.

## Requirements

### Requirement: Practice screen surfaces saved routines

The practice screen SHALL be a three-state flow: choosing, reviewing and practising. The choosing state SHALL present the saved practice routines as its primary content, with the quick practice and the routine editor as secondary actions, and every state SHALL offer a single primary action.

#### Scenario: User opens the practice screen with saved routines
- **WHEN** the user opens the practice screen and at least one routine is saved
- **THEN** the app lists the saved routines first, each with a way to start it and to edit it

#### Scenario: User starts a saved routine from the list
- **WHEN** the user chooses to start a saved routine
- **THEN** the app moves to the reviewing state with the plan of that routine instead of starting the timer immediately

#### Scenario: Reviewing the plan
- **WHEN** the reviewing state is shown
- **THEN** it shows the routine name, its blocks, the total planned time and the chosen guitar type, with a single primary action to start

#### Scenario: Starting from the review
- **WHEN** the user starts the reviewed plan
- **THEN** the app begins the practice session with exactly the blocks that were reviewed

#### Scenario: Going back without starting
- **WHEN** the user goes back from the reviewing state
- **THEN** the app returns to the choosing state and no session starts

#### Scenario: Editing from the choosing state
- **WHEN** the user chooses to edit a routine
- **THEN** the routine editor opens as a secondary path and the choosing state keeps its primary action

### Requirement: User can create a new routine or start a quick practice

The system SHALL keep creating a new practice that opens the routine editor as a secondary path, SHALL start a quick practice as a free timed session without designing blocks or passing through the reviewing state, and SHALL keep saving a finished quick practice to the history.

#### Scenario: User creates a new practice
- **WHEN** the user chooses to create a new practice
- **THEN** the app opens the routine editor with the option to save the routine and to review it before starting

#### Scenario: User starts a quick practice
- **WHEN** the user starts a quick practice
- **THEN** the app begins a session that counts up freely with no designed blocks and lets the user finish at any time

#### Scenario: Quick practice is saved
- **WHEN** the user finishes a quick practice and saves it
- **THEN** the app records a practice session in the history that the user can edit afterwards like any other

### Requirement: Saved practices can be edited

The system SHALL let the user edit a saved practice session, including its title, notes, completion state, duration and its blocks, and SHALL keep the reported totals consistent with the edited blocks.

#### Scenario: User edits the blocks of a saved practice
- **WHEN** the user changes a block's name, category, real time or planned time and saves
- **THEN** the app stores the edited blocks and reports a total duration and a per-category split consistent with them

#### Scenario: User removes every block
- **WHEN** the user removes all the blocks of a saved practice and saves
- **THEN** the app stores the practice without blocks and uses the duration provided directly

#### Scenario: Edited practice keeps its identity
- **WHEN** a saved practice is edited
- **THEN** the app updates that same practice in the history instead of adding a new one

### Requirement: Saved practices can be deleted

The system SHALL let the user delete a saved practice session, requiring a confirmation, and SHALL NOT delete the recordings associated with it.

#### Scenario: User deletes a saved practice
- **WHEN** the user confirms the deletion of a saved practice
- **THEN** the app removes the practice from the history

#### Scenario: Recordings survive the deletion
- **WHEN** a saved practice with recordings is deleted
- **THEN** the app keeps the recordings available instead of deleting them

### Requirement: Practice day detail always shows that day's recordings

The system SHALL associate each of the day's recordings with a saved practice of that day when possible and SHALL still show the remaining recordings of the day instead of hiding them.

#### Scenario: Recording matches its practice
- **WHEN** a recording belongs to a saved practice of the day
- **THEN** the app shows it inside that practice

#### Scenario: Recording has no matching practice
- **WHEN** a recording of the day cannot be associated with any saved practice of that day and the day has several practices
- **THEN** the app shows it in a dedicated section of the day's recordings instead of dropping it

#### Scenario: Only one practice that day
- **WHEN** the day has exactly one saved practice
- **THEN** the app shows the recordings of that day that are not linked to it under that practice

#### Scenario: Recordings still loading
- **WHEN** the day detail is still loading the recordings
- **THEN** the app indicates that the recordings are loading instead of reporting that there are none

### Requirement: Loading states cover remote recording catalog

The system SHALL keep showing a loading state on the recordings library until the attempt to load the remote catalog has finished, not only the local read.

#### Scenario: Connected provider with slow catalog
- **WHEN** the user has a connected storage provider and the remote catalog is still loading
- **THEN** the app shows the loading state instead of an incomplete list

#### Scenario: Remote catalog fails
- **WHEN** the remote catalog cannot be loaded
- **THEN** the app stops the loading state and shows the locally available recordings

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

### Requirement: Practice material accepts image files

The system SHALL offer images as attachable study material, SHALL accept JPEG, PNG, WebP, AVIF and GIF files up to 10 MB, SHALL store them through the same local or cloud asset flow as other files, and SHALL preview them inside the material panel with a way to open them in a new tab. Unsupported formats and oversized files SHALL be rejected with a readable error.

#### Scenario: Attaching an image
- **WHEN** the user chooses the image option and selects a supported image file
- **THEN** the image is stored, attached to the current block or repertoire item and shown in the material list

#### Scenario: Previewing an image
- **WHEN** the user selects an attached image
- **THEN** the material panel shows the image without leaving the practice screen

#### Scenario: Opening the image on its own
- **WHEN** the user activates the open action of an attached image
- **THEN** the image opens in a new tab

#### Scenario: Unsupported image
- **WHEN** the user selects an SVG, HEIC/HEIF or another unsupported file for the image option
- **THEN** the app rejects it and explains which formats are accepted

#### Scenario: Oversized image
- **WHEN** the user selects an image larger than 10 MB
- **THEN** the app rejects it before uploading and shows a size error

#### Scenario: Image without an account
- **WHEN** a guest attaches an image
- **THEN** the image is kept in the local library like other guest files

### Requirement: Songsterr links can be attached and open externally

The system SHALL offer Songsterr in the material menu, SHALL accept only HTTPS links on the Songsterr domain, SHALL attach the link to the current block or repertoire item, and SHALL open it in a new tab instead of embedding it.

#### Scenario: Attaching a Songsterr link
- **WHEN** the user chooses the Songsterr option and enters a valid Songsterr URL
- **THEN** the link is attached to the current block or repertoire item

#### Scenario: Opening an attached link
- **WHEN** the user selects a Songsterr material
- **THEN** the panel names the material and offers opening it in a new tab

#### Scenario: Invalid Songsterr link
- **WHEN** the user enters a non-HTTPS URL or a URL outside the Songsterr domain
- **THEN** the app rejects it and keeps the form open with an error

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

The system SHALL offer an option to keep the timer running after a block's planned time until the user advances to the next block, SHALL show a brief block-complete notice that dismisses itself, SHALL keep the next-block action available while the timer waits or runs overtime, SHALL include the overtime in the session total, and SHALL leave the option off by default.

#### Scenario: The option is off
- **WHEN** a block reaches its planned time with the option off
- **THEN** the timer stops at zero and waits for the user to advance, as before

#### Scenario: The option is on
- **WHEN** a non-final block reaches its planned time with the option on
- **THEN** the timer keeps running in that block and the total keeps increasing

#### Scenario: The notice stays visible
- **WHEN** a block reaches its planned time and the timer is waiting or running overtime
- **THEN** a brief notice appears and dismisses itself, while the next-block action stays visible until the user advances

#### Scenario: The block-complete signal sounds once
- **WHEN** a block reaches its planned time and the timer keeps running overtime
- **THEN** the block-complete sound plays once and does not play again on later timer updates

#### Scenario: Resuming overtime does not repeat the signal
- **WHEN** the user pauses during overtime and resumes the same block
- **THEN** the block-complete sound does not play again

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

The system SHALL show each saved block's detail entries and SHALL resolve a repertoire link to the song title, with the part when present on its own line without a "Parte:" prefix, and a lick link to the lick title, including when the block names only the item.

#### Scenario: A block linked only to a song
- **WHEN** a saved block names a song but no part
- **THEN** the completed practice shows the song title for that block

#### Scenario: A block linked to a song and a part
- **WHEN** a saved block names a song and a part
- **THEN** the completed practice shows both the song and the part, with the part on its own line and no "Parte:" prefix

#### Scenario: A block linked to a lick
- **WHEN** a saved block names a lick
- **THEN** the completed practice shows the lick title for that block

#### Scenario: A block with details
- **WHEN** a saved block has detail entries
- **THEN** the completed practice lists them in the "Qué se practicó" column

### Requirement: A saved practice records the guitar type used

The system SHALL let the user choose electric or acoustic guitar for a practice session, SHALL offer that choice while the practice runs, in manual practice entry and in the session editor, and SHALL store the chosen type with the session. A quick practice started from a repertoire item SHALL ask for the type before starting, preselected from the item's declared type or from the last used type, and SHALL require the user to confirm electric or acoustic. Other new practices SHALL start from the last used type or stay unset, and the system SHALL never invent one.

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
- **THEN** the confirmation opens with that type selected and the session starts with it once the user confirms

#### Scenario: A quick practice from an item without a type
- **WHEN** the item declares no guitar type and the user has a last used type
- **THEN** the confirmation opens with the last used type selected and the session starts with it once the user confirms

#### Scenario: No known guitar type
- **WHEN** the item declares no guitar type and there is no last used type
- **THEN** the confirmation asks the user to choose electric or acoustic and no session starts until one is chosen

#### Scenario: Cancelling the confirmation
- **WHEN** the user closes the confirmation without starting
- **THEN** no session starts and the repertoire stays as it was

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

### Requirement: A saved practice keeps the average BPM of each block

The system SHALL record an average BPM for each block of a timed practice, using only that block's metronome time, and SHALL keep that value when the practice is edited, reloaded or synchronized.

#### Scenario: A practice with several blocks
- **WHEN** a practice with several blocks is saved and the metronome ran at different tempos in each block
- **THEN** each block stores its own average BPM

#### Scenario: Tempo changes inside a block
- **WHEN** the metronome tempo changes while a block is running
- **THEN** that block's average BPM is weighted by the time spent at each tempo

#### Scenario: A block without metronome
- **WHEN** a block finishes without the metronome having run
- **THEN** the block stores no average BPM

#### Scenario: Manual practice
- **WHEN** a practice is recorded manually
- **THEN** its blocks store no average BPM

#### Scenario: Practice from before this change
- **WHEN** a stored practice has no per-block BPM
- **THEN** it loads normally and its blocks remain without a per-block value

#### Scenario: Editing other fields
- **WHEN** the user edits a saved practice's title, notes or block duration without changing its tempo
- **THEN** the stored per-block average BPM is preserved

#### Scenario: Stored BPM survives reload and sync
- **WHEN** a practice with per-block BPM is reloaded or merged from another device
- **THEN** its per-block values are preserved, and an invalid stored value is discarded without losing the block

### Requirement: A practice plan carries an optional guitar type

The system SHALL let the user choose electric, acoustic or unspecified while designing a practice plan, SHALL store the choice with a saved routine, SHALL carry it into the session when the plan or routine starts, and SHALL show the chosen type as context in the plan header.

#### Scenario: Choosing the type while designing a plan
- **WHEN** the user designs a new practice plan
- **THEN** the plan offers "Eléctrica", "Acústica" and "Sin especificar" and keeps the choice while the user edits the blocks

#### Scenario: Saving a routine
- **WHEN** the user saves a routine with a guitar type
- **THEN** the routine stores that type and shows it again when the routine is selected for editing

#### Scenario: Starting a plan or saved routine
- **WHEN** the user starts a plan or a saved routine that has a guitar type
- **THEN** the session starts with that type without asking for it again

#### Scenario: Repeating a saved practice
- **WHEN** the user repeats a saved practice that has a guitar type
- **THEN** the new session keeps that type

#### Scenario: Unspecified type
- **WHEN** the user leaves the guitar type unspecified
- **THEN** the plan remains valid and does not display a type in its header

#### Scenario: Older routines
- **WHEN** a routine saved before this change has no guitar type
- **THEN** it opens and starts normally without requiring a type

### Requirement: The running timer does not offer the guitar-type control

The system SHALL NOT offer a control to change the guitar type on the running timer, SHALL show the chosen type as read-only context when one is set, and SHALL keep the choice available while preparing the plan, registering a manual practice and editing a saved practice.

#### Scenario: Running practice
- **WHEN** a practice is running
- **THEN** the timer shows no guitar-type selector

#### Scenario: Showing the chosen type
- **WHEN** the running session has a guitar type
- **THEN** the practice shows it as text and offers no way to change it there

#### Scenario: No type
- **WHEN** the running session has no guitar type
- **THEN** no guitar-type text or control is shown

#### Scenario: Other entry points
- **WHEN** the user prepares a plan, registers a manual practice or edits a saved practice
- **THEN** each of those flows still offers the guitar-type choice

### Requirement: A saved practice keeps its guitar type editable

Editing a saved practice SHALL let the user set, change or clear its guitar type, SHALL store it with that practice only, and SHALL leave the rest of the practice and its source routine unchanged.

#### Scenario: Changing the type
- **WHEN** the user changes the guitar type of a saved practice and saves
- **THEN** that practice shows the new type after a reload

#### Scenario: Clearing the type
- **WHEN** the user chooses "Sin especificar" for a saved practice and saves
- **THEN** the practice is stored without a guitar type

#### Scenario: Other fields survive
- **WHEN** the user changes only the guitar type of a saved practice
- **THEN** its title, notes, completion state, duration and blocks keep their previous values

#### Scenario: The source routine is untouched
- **WHEN** the user changes the guitar type of a practice started from a saved routine
- **THEN** the saved routine keeps its own guitar type

### Requirement: A running practice stays reachable from a floating bar

While a practice is active, the system SHALL show a floating bar that names the practice and offers resume/pause and stop, SHALL treat the whole bar as the way back to the practice, and SHALL keep the text fully legible on hover. Inside the practice screen the bar SHALL appear only while the timer is out of view, and SHALL take the user back to the timer when activated.

#### Scenario: Reading the bar
- **WHEN** the pointer is over the floating bar
- **THEN** its text keeps its normal opacity and only the border or contrast changes

#### Scenario: Pausing and resuming from anywhere
- **WHEN** the practice is running and the user activates the pause control
- **THEN** the timer pauses and the same control turns into resume, without leaving the current screen

#### Scenario: Returning with the bar
- **WHEN** the user activates the bar outside the practice screen
- **THEN** the system opens the practice

#### Scenario: Scrolled past the timer
- **WHEN** the user is on the practice screen and scrolls the timer card out of view
- **THEN** the bar appears with the same name, clock and controls, and disappears when the timer is visible again

#### Scenario: Opening the practice screen at the top
- **WHEN** the user enters the practice screen while the timer card is visible in the viewport
- **THEN** the bar stays hidden until the timer card actually leaves the viewport

#### Scenario: Switching to split view
- **WHEN** the user toggles split view while on the practice screen and the timer card remains visible
- **THEN** the bar stays hidden after the timer card is placed in its new layout

#### Scenario: Returning to the timer
- **WHEN** the user activates the bar while already on the practice screen
- **THEN** the system scrolls the timer card back into view instead of navigating

### Requirement: The floating bar can finish the practice

The system SHALL make the floating bar's stop control finish the practice through the existing confirmation and completion flow, SHALL reflect a completed or non-resumable timer by disabling the controls that cannot act, and SHALL bring the user to the practice screen so the completion dialog is visible.

#### Scenario: Stopping from another screen
- **WHEN** the user activates stop outside the practice screen and confirms
- **THEN** the practice is finished, the user lands on the practice screen and the completion dialog is shown

#### Scenario: Cancelling the stop
- **WHEN** the user opens the stop confirmation and cancels it
- **THEN** the practice keeps its state and the bar stays where it was

#### Scenario: Nothing left to resume
- **WHEN** the current block has ended and the timer is waiting for the next one
- **THEN** the resume control is disabled instead of starting a block that cannot run

#### Scenario: Practice already finished
- **WHEN** the practice has been completed and is waiting to be saved
- **THEN** the bar's timer controls are disabled and the completion flow stays available

### Requirement: The floating practice bar animates when it appears and disappears

The system SHALL animate the floating practice bar as it enters and leaves, SHALL keep it non-interactive while it is leaving, and SHALL skip the animation when the user prefers reduced motion.

#### Scenario: The bar appears
- **WHEN** the bar becomes visible because the user leaves the practice screen or because the timer card leaves the viewport
- **THEN** the bar fades in with a short upward movement instead of appearing abruptly

#### Scenario: The bar disappears
- **WHEN** the bar stops being needed because the user returns to the practice screen or because the timer card is visible again
- **THEN** it fades out and can no longer be activated while it leaves

#### Scenario: Reduced motion
- **WHEN** the user has reduced motion enabled
- **THEN** the bar appears and disappears without movement and without the enter or exit delay

### Requirement: The home practice plan lists block details without repeated labels

The system SHALL list each block's detail entries in the home screen's practice plan without repeating the "Detalle del bloque" label, SHALL show a linked repertoire part on its own line without a "Parte:" prefix, and SHALL keep the material label.

#### Scenario: A block with details
- **WHEN** the home plan shows a block with several detail entries
- **THEN** each entry appears on its own line and no entry is preceded by "Detalle del bloque"

#### Scenario: A repertoire block with a part
- **WHEN** the block is linked to a repertoire song with a part
- **THEN** the part appears on its own line with no "Parte:" prefix

#### Scenario: Material
- **WHEN** the block has attached material
- **THEN** the material keeps its "Material:" label

#### Scenario: No details
- **WHEN** the block has no detail entries, part or material
- **THEN** the plan shows the existing empty state for that block

### Requirement: The home practice plan breaks long text with hyphens

The system SHALL wrap long block titles, detail entries and labels inside their cells, SHALL break long words with a hyphen when they do not fit, and SHALL NOT replace or hide the text.

#### Scenario: A long word in a narrow cell
- **WHEN** a title or detail contains a word wider than its cell
- **THEN** the word continues on the next line after a hyphen instead of overflowing the table

#### Scenario: Narrow screen
- **WHEN** the home plan is viewed on a narrow screen
- **THEN** the table stays within the viewport and every detail remains readable

### Requirement: The running practice lists every remaining block

While a practice is running, the system SHALL show every block that remains after the current one in plan order, with its name, skill, planned duration and detail entries, SHALL mark the immediate next block, and SHALL update the list when the timer advances.

#### Scenario: Several blocks remain
- **WHEN** the current block is not the last one
- **THEN** the practice screen shows the next block and every block after it, with the immediate next block marked

#### Scenario: The timer advances
- **WHEN** the practice moves to the next block
- **THEN** that block leaves the list and the following blocks remain in order

#### Scenario: The last block
- **WHEN** no blocks remain after the current one
- **THEN** the section shows an empty state instead of an empty list

#### Scenario: Practice completed
- **WHEN** the practice is completed and the completion dialog is shown
- **THEN** the remaining-blocks section is not shown

#### Scenario: Long block text
- **WHEN** a block name or detail does not fit
- **THEN** it wraps inside its card without overflowing

### Requirement: The timer and metronome cards keep matching heights

On wide viewports the system SHALL place the timer and the metronome in the same row with the same height, SHALL let the timer card fill its column instead of ending above the metronome, and SHALL stack both cards at full width on narrow viewports.

#### Scenario: Wide viewport
- **WHEN** the practice screen is shown on a wide viewport
- **THEN** the timer and metronome cards start at the same height and end at the same height, with no empty gap below either card

#### Scenario: Narrow viewport
- **WHEN** the practice screen is shown on a narrow viewport
- **THEN** the two cards stack, each taking the full available width without horizontal overflow

#### Scenario: The timer grows
- **WHEN** the timer shows a longer title, the song picker or another extra row
- **THEN** the metronome card keeps matching the timer's height instead of staying shorter

### Requirement: A saved take is navigated on its waveform

The system SHALL let the user move the playback of a saved take by tapping or dragging on its waveform, SHALL draw the playhead on that waveform, SHALL expose the waveform as a keyboard-operable slider, SHALL keep the fixed-step rewind and forward controls, and MUST NOT show a separate progress bar for that take.

#### Scenario: Tapping the waveform
- **WHEN** the user taps a point of the waveform
- **THEN** playback moves to the position that corresponds to that point and the playhead stays there

#### Scenario: Dragging the waveform
- **WHEN** the user drags across the waveform
- **THEN** the playback position follows the pointer while it moves and stops at the released point

#### Scenario: Seeking with the keyboard
- **WHEN** the waveform has focus and the user presses an arrow, Home or End key
- **THEN** the position moves by a short step or to the start or end, and the new position and time are announced

#### Scenario: Playback follows the waveform
- **WHEN** a take is playing
- **THEN** the playhead advances over the waveform and stays in sync with the audio

#### Scenario: No separate progress bar
- **WHEN** a saved take is shown with its waveform
- **THEN** the separate progress bar is absent and the time labels stay visible

### Requirement: The recording transport sits beside the recording name

The recorder SHALL place its transport controls next to the recording-name field on the same row when there is room, SHALL place them directly below the field on narrow viewports, SHALL keep the framed wave display and the recorder status visible, and SHALL keep each control's disabled state and accessible name.

#### Scenario: A wide recorder
- **WHEN** the recorder is shown on a wide viewport
- **THEN** the recording-name field and the transport controls share a row, with the buttons to the right of the name

#### Scenario: A narrow recorder
- **WHEN** the recorder is shown on a phone
- **THEN** the transport moves below the recording-name field without overlapping the wave display

#### Scenario: Recording state
- **WHEN** a recording is in progress
- **THEN** the record control is unavailable, stop is available and the playback controls stay disabled until a take exists

### Requirement: Feedback preferences are read when the practice closes

The system SHALL read the mood and focus preferences when the practice completion sheet opens, so a change made in Settings applies to the next finished practice without reloading the app, SHALL ask only for the metrics enabled at that moment, and SHALL save with empty metrics when they are unanswered.

#### Scenario: Enabling a metric during a practice
- **WHEN** the user enables mood while a practice is running and then finishes it
- **THEN** the completion sheet asks for mood without needing a reload

#### Scenario: Disabling a metric during a practice
- **WHEN** the user disables focus while a practice is running and then finishes it
- **THEN** the completion sheet does not ask for focus

#### Scenario: Answering after the change
- **WHEN** the user answers an enabled metric in the completion sheet
- **THEN** the stored practice keeps that value and the other metric stays empty

#### Scenario: Skipping after the change
- **WHEN** the user saves the practice without answering an enabled metric
- **THEN** the practice is stored and that metric stays empty

### Requirement: A finished practice is saved from a compact sheet

The system SHALL close a finished practice with a compact sheet that shows the summary first, keeps the session notes behind a collapsed action and leaves the save action as the only primary button.

#### Scenario: Opening the completion sheet
- **WHEN** a practice finishes
- **THEN** the sheet shows the total time and the practice summary before any input

#### Scenario: Writing notes
- **WHEN** the user activates the notes action
- **THEN** the session notes field expands in place and the summary stays visible

#### Scenario: Saving
- **WHEN** the user saves the practice
- **THEN** the sheet closes and the practice is stored exactly as before

#### Scenario: Leaving without saving
- **WHEN** the user chooses to exit without saving
- **THEN** the sheet offers the same discard confirmation it offered before

### Requirement: Mood and focus are optional session metrics

The system SHALL let the user record a mood value and a focus value for a practice, each on a five-emoji scale, asked at the end of the practice about the state the user had when starting it. Both metrics SHALL be off by default, SHALL be enabled independently from a settings section, SHALL be skippable, and SHALL only be stored when they were enabled and answered.

#### Scenario: Both metrics are off
- **WHEN** the user finishes a practice with mood and focus disabled
- **THEN** the completion sheet asks neither and the session is stored without them

#### Scenario: Only one metric is on
- **WHEN** the user enables mood but not focus
- **THEN** the completion sheet asks only for mood

#### Scenario: Answering the scale
- **WHEN** the user picks one of the five emojis for mood or focus
- **THEN** the chosen value is selected visibly and the session stores it with a value from one to five

#### Scenario: Skipping the question
- **WHEN** the user saves the practice without choosing an emoji
- **THEN** the practice is saved and that metric stays empty

#### Scenario: Returning to a session without metrics
- **WHEN** a stored practice has no mood or focus
- **THEN** it loads and behaves exactly as before

### Requirement: The recorder behaves like a tape deck

The recorder SHALL sit inside a framed display with the waveform drawn inside it, SHALL move the live waveform from right to left while recording and SHALL keep the complete waveform of the recorded take inside the same frame after stopping. Its controls SHALL be a transport row —record, stop, play, pause, rewind and forward— instead of a single form button, and every control SHALL keep an accessible name and a disabled state that matches what it can do.

#### Scenario: Recording
- **WHEN** the user starts recording
- **THEN** the frame shows the incoming waveform moving from right to left and the record control becomes the active state

#### Scenario: Stopping
- **WHEN** the user stops recording
- **THEN** the take is saved and its complete waveform is drawn inside the frame

#### Scenario: Playing a take
- **WHEN** the user plays a saved take
- **THEN** the transport shows playback, pause becomes available and the playhead moves over the waveform

#### Scenario: Seeking
- **WHEN** the user activates rewind or forward during playback
- **THEN** playback moves back or ahead by a short fixed step and the waveform follows the new position

#### Scenario: Unavailable controls
- **WHEN** no take is selected or nothing is recording
- **THEN** the controls that cannot act are disabled instead of doing nothing silently

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** the live waveform updates without a continuous scrolling animation

### Requirement: Saving a routine confirms the result

The system SHALL confirm in place when a routine is saved or updated, SHALL announce the confirmation to assistive technology, SHALL clear it after a short time and SHALL report a failure with an error instead of silence.

#### Scenario: Saving a new routine
- **WHEN** the user saves a routine for the first time
- **THEN** a confirmation naming the saved routine appears next to the actions and is announced

#### Scenario: Updating a routine
- **WHEN** the user saves changes to an existing routine
- **THEN** the confirmation says the routine was updated

#### Scenario: The confirmation clears
- **WHEN** a few seconds pass after saving
- **THEN** the confirmation disappears without moving the surrounding controls

#### Scenario: Saving fails
- **WHEN** the routine cannot be saved
- **THEN** the app shows an error message and keeps the editor open with its contents

### Requirement: A practice can record the specific guitar used

The system SHALL store an optional guitar identifier with a practice, SHALL preserve it across reload and sync, and SHALL keep the type-only choice available when no specific guitar is recorded.

#### Scenario: Storing the guitar
- **WHEN** a practice is saved with a specific guitar
- **THEN** the saved practice keeps that guitar

#### Scenario: Running practice shows the guitar
- **WHEN** the running session has a specific guitar
- **THEN** the practice shows its name as read-only context and offers no control to change it there

#### Scenario: A deleted guitar
- **WHEN** a saved practice references a guitar that no longer exists
- **THEN** the practice loads normally and keeps its recorded time and type

#### Scenario: Practice from before this change
- **WHEN** a stored practice has no specific guitar
- **THEN** it loads normally and remains attributed only to its type

#### Scenario: Stored guitar survives reload and sync
- **WHEN** a practice with a specific guitar is reloaded or merged from another device
- **THEN** the guitar identifier is preserved

### Requirement: A new practice inherits the guitar instead of asking

The system SHALL attribute a new practice to the user's only guitar without asking, SHALL otherwise inherit the last guitar used on the device, SHALL show the guitar selector only when the user has more than one guitar, and SHALL NOT add a guitar to an existing practice when it is edited.

#### Scenario: One guitar
- **WHEN** the user has a single guitar and starts a practice
- **THEN** the practice is attributed to that guitar without showing a selector

#### Scenario: Several guitars
- **WHEN** the user has more than one guitar and starts a practice
- **THEN** the last guitar used on the device is preselected and the selector is available

#### Scenario: Changing the guitar
- **WHEN** the user chooses another guitar for the practice
- **THEN** the practice stores it and it becomes the guitar inherited by the next practice

#### Scenario: The inherited guitar no longer exists
- **WHEN** the last guitar used was deleted
- **THEN** the practice falls back to the only remaining guitar or to the type-only choice without failing

#### Scenario: Editing an existing practice
- **WHEN** the user edits a practice that recorded no guitar
- **THEN** no guitar is added to it

#### Scenario: No guitars
- **WHEN** the user has no guitars
- **THEN** the practice keeps the electric or acoustic choice and remains valid

### Requirement: A free practice is complete when the user ends it

The system SHALL store a practice that has no planned duration as complete when the user finishes it, SHALL present it as a completed practice in the day detail, and SHALL NOT describe it as finished before completing a routine. A planned practice ended before its last block SHALL keep reporting that it was finished early.

#### Scenario: A free practice from the practice screen
- **WHEN** the user starts a quick practice, stops the timer with the finish control and saves it
- **THEN** the practice is stored as complete and the day detail does not say it was finished before completing the routine

#### Scenario: A free practice from the repertoire
- **WHEN** the user starts a quick practice from a repertoire item and ends it with the finish control
- **THEN** the practice is stored as complete and shown as such

#### Scenario: A planned routine ended early
- **WHEN** the user finishes a planned routine before its last block ends
- **THEN** the practice keeps reporting that it was finished before completing the routine

#### Scenario: A planned routine reaches its end
- **WHEN** the timer completes the last block of a planned routine
- **THEN** the practice is stored as complete, as before

#### Scenario: Editing a free practice
- **WHEN** the user edits and saves a free practice that was stored as complete
- **THEN** it stays complete unless the user changes its completion state explicitly

### Requirement: The practice settings offer a session time target

The system SHALL let the user set an optional whole-minute target for the current practice, SHALL offer it in the practice settings of both planned and free sessions, and SHALL also offer it in the confirmation that starts a free practice from the repertoire.

#### Scenario: Setting a target
- **WHEN** the user opens the practice settings and sets a target of 30 minutes
- **THEN** the session keeps that target and the timer continues running

#### Scenario: Free practice settings
- **WHEN** the user opens the practice settings during a free practice
- **THEN** the time target is available even though the session has no planned blocks

#### Scenario: Setting the target before starting
- **WHEN** the user sets a target in the confirmation of a free repertoire practice and starts it
- **THEN** the session starts with that target

#### Scenario: Clearing the target
- **WHEN** the user removes the target
- **THEN** the session continues without a target and no alert is scheduled

#### Scenario: An invalid target
- **WHEN** the user enters zero, a negative value or a fraction of a minute
- **THEN** the value is not accepted as a target

#### Scenario: The target survives a pause
- **WHEN** the user pauses and resumes the practice
- **THEN** the target is kept for the same session

#### Scenario: A target already reached
- **WHEN** the user sets a target shorter than the time already practised
- **THEN** the timer pauses and the target notice appears without waiting for more time

### Requirement: The time target pauses the practice when reached

The system SHALL play the end sound once, pause the timer and show a brief notice that dismisses itself when the elapsed time reaches the target, SHALL let the user resume past the target or finish the practice, and SHALL NOT alert again for the same target after the user resumes.

#### Scenario: Reaching the target
- **WHEN** the elapsed time reaches the session target
- **THEN** the end sound plays once, the timer pauses and a brief notice states that the target was reached

#### Scenario: The target notice dismisses itself
- **WHEN** the target notice has been visible for a few seconds
- **THEN** it disappears without blocking the timer, the resume action or the finish action

#### Scenario: The timer updates past the target
- **WHEN** a timer update crosses the target before the pause takes effect
- **THEN** the timer stops at the target instead of continuing to count

#### Scenario: Continuing after the target
- **WHEN** the user resumes the practice after the notice
- **THEN** the timer continues counting, the notice disappears and the sound does not play again for that target

#### Scenario: Finishing after the target
- **WHEN** the user finishes the practice from the target notice
- **THEN** the completion flow opens with the time practised so far

#### Scenario: No target
- **WHEN** the session has no target
- **THEN** the timer behaves as before and no target notice appears

#### Scenario: Changing the target after reaching it
- **WHEN** the user sets a new target after the previous one was reached
- **THEN** the session uses the new target and the alert for it can fire once

### Requirement: The end-of-practice summary is neutral

The completion dialog SHALL present itself as a session summary and SHALL NOT announce the practice as finished before the user saves it.

#### Scenario: Opening the summary
- **WHEN** the timer ends or the user finishes the session
- **THEN** the dialog shows a neutral session-summary heading and a review-and-save action instead of a finished-practice message

#### Scenario: Saving the practice
- **WHEN** the user saves from the summary
- **THEN** the practice is stored exactly as before

### Requirement: The wellbeing response scale uses no emojis

The system SHALL let the user record mood and focus with a one-to-five scale that shows the number and a textual label for each value, SHALL keep both metrics optional and clearable, and SHALL NOT use emoji characters in the control.

#### Scenario: Choosing a value
- **WHEN** the user picks a value for mood or focus
- **THEN** the control shows that value and its textual label and the session stores the number

#### Scenario: Different labels per metric
- **WHEN** the user opens the mood and the focus controls
- **THEN** each shows labels that describe its own metric, such as "Bajo" or "Enfocado", instead of a shared face

#### Scenario: Clearing a value
- **WHEN** the user chooses not to answer a metric
- **THEN** the control shows no value and the session stores none

#### Scenario: Reading the control with a screen reader
- **WHEN** the user reaches the scale with a screen reader
- **THEN** each option announces its metric, its number and its label

#### Scenario: No emoji
- **WHEN** the mood and focus controls are shown
- **THEN** no emoji character appears in them

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
